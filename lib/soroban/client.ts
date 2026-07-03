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
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const c = client as any;
  if (typeof c[functionName] !== 'function') {
    throw new Error(`Function '${functionName}' not found on contract`);
  }

  const at: contract.AssembledTransaction<unknown> = await c[functionName](args, { simulate: false });

  await at.simulate({ restore: false });

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
