'use client';

import { contract, rpc, xdr } from '@stellar/stellar-sdk';
import type { NetworkConfig, LoadedContract } from '@/types';
import { parseFunctions, parseUdts } from './spec-parser';

export async function loadContract(
  contractId: string,
  network: NetworkConfig
): Promise<LoadedContract> {
  const client = await contract.Client.from({
    contractId,
    networkPassphrase: network.networkPassphrase,
    rpcUrl: network.rpcUrl,
  });

  const entries = client.spec.entries;
  const functions = parseFunctions(entries);
  const udts = parseUdts(entries);

  return { contractId, network, functions, udts };
}

export interface SimulateResult {
  returnValue: unknown;
  cost?: { cpuInsns: string; memBytes: string };
  latencyMs: number;
}

export async function simulateCall(
  contractId: string,
  network: NetworkConfig,
  functionName: string,
  args: Record<string, unknown>
): Promise<SimulateResult> {
  const t0 = performance.now();

  const client = await contract.Client.from({
    contractId,
    networkPassphrase: network.networkPassphrase,
    rpcUrl: network.rpcUrl,
  });

  // Dynamic dispatch — contract.Client generates one method per spec function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = client as any;
  if (typeof c[functionName] !== 'function') {
    throw new Error(`Function '${functionName}' not found on contract`);
  }

  const at: contract.AssembledTransaction<unknown> = await c[functionName](args);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const sim = at.simulation as any;
  const costInfo = sim?.cost
    ? { cpuInsns: String(sim.cost.cpuInsns ?? 0), memBytes: String(sim.cost.memBytes ?? 0) }
    : undefined;

  return {
    returnValue: at.result,
    cost: costInfo,
    latencyMs: performance.now() - t0,
  };
}

export interface InvokeResult {
  txHash: string;
  returnValue: unknown;
  latencyMs: number;
}

// Whether the last simulation failed because the transaction exceeded the
// resource limits (fee, CPU instructions or memory).
function isInsufficientResources(at: contract.AssembledTransaction<unknown>): boolean {
  const sim = at.simulation;
  return !!sim && rpc.Api.isSimulationError(sim) && /insufficient\s*resource/i.test(sim.error);
}

// Simulates with automatic restore of expired ledger entries (restore: true).
// If the simulation fails with InsufficientResources, bumps the transaction
// fee (resource limits) and retries exactly once.
async function simulateWithRestore(at: contract.AssembledTransaction<unknown>): Promise<void> {
  await at.simulate({ restore: true });
  if (isInsufficientResources(at) && at.built) {
    const fee = Number(at.built.fee);
    if (Number.isFinite(fee) && fee > 0) {
      at.built.fee = String(Math.ceil(fee * 2));
      await at.simulate({ restore: true });
    }
  }
}

// Pre-flight check: whether the contract has expired ledger entries that must
// be restored before the invocation can succeed (i.e. a restore transaction
// will need to be signed and sent before the invoke transaction).
export async function checkRestoreRequired(
  contractId: string,
  network: NetworkConfig,
  functionName: string,
  args: Record<string, unknown>,
  publicKey: string
): Promise<boolean> {
  const client = await contract.Client.from({
    contractId,
    networkPassphrase: network.networkPassphrase,
    rpcUrl: network.rpcUrl,
    publicKey,
  });

  // Dynamic dispatch — contract.Client generates one method per spec function
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = client as any;
  if (typeof c[functionName] !== 'function') {
    throw new Error(`Function '${functionName}' not found on contract`);
  }

  const at: contract.AssembledTransaction<unknown> = await c[functionName](args, { simulate: false });
  await at.simulate({ restore: false });
  return !!at.simulation && rpc.Api.isSimulationRestore(at.simulation);
}

export async function invokeCall(
  contractId: string,
  network: NetworkConfig,
  functionName: string,
  args: Record<string, unknown>,
  publicKey: string,
  signTransaction: (xdrBase64: string) => Promise<string>
): Promise<InvokeResult> {
  const t0 = performance.now();

  const client = await contract.Client.from({
    contractId,
    networkPassphrase: network.networkPassphrase,
    rpcUrl: network.rpcUrl,
    publicKey,
    // Required for automatic restore: the SDK builds and signs the
    // RestoreFootprint transaction through this handler, prompting the wallet
    // a first time, before the invoke transaction is signed a second time.
    // (The SDK expects the Freighter-style `{ signedTxXdr }` return shape.)
    signTransaction: async (txXdr) => {
      const signedTxXdr = await signTransaction(txXdr);
      return { signedTxXdr };
    },
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = client as any;
  if (typeof c[functionName] !== 'function') {
    throw new Error(`Function '${functionName}' not found on contract`);
  }

  const at: contract.AssembledTransaction<unknown> = await c[functionName](args, { simulate: false });

  await simulateWithRestore(at);

  const builtTx = at.built;
  if (!builtTx) throw new Error('Transaction build failed — simulation may have failed');

  const unsignedXdr = builtTx.toXDR();
  const signedXdr = await signTransaction(unsignedXdr);

  const server = new rpc.Server(network.rpcUrl, { allowHttp: true });
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const submitTx = xdr.TransactionEnvelope.fromXDR(signedXdr, 'base64') as any;
  const response = await server.sendTransaction(submitTx);

  let txResponse: rpc.Api.GetTransactionResponse | null = null;
  if ('hash' in response) {
    for (let i = 0; i < 15; i++) {
      await new Promise((r) => setTimeout(r, 2000));
      txResponse = await server.getTransaction(response.hash);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((txResponse as any)?.status !== 'NOT_FOUND') break;
    }
  }

  return {
    txHash: 'hash' in response ? response.hash : '',
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    returnValue: txResponse && 'returnValue' in txResponse ? (txResponse as any).returnValue : null,
    latencyMs: performance.now() - t0,
  };
}
