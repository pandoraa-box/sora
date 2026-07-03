'use client';

import { StellarWalletsKit, Networks } from '@creit.tech/stellar-wallets-kit';
import { FreighterModule } from '@creit.tech/stellar-wallets-kit/modules/freighter';
import { xBullModule } from '@creit.tech/stellar-wallets-kit/modules/xbull';
import { LobstrModule } from '@creit.tech/stellar-wallets-kit/modules/lobstr';

function networkPassphraseToEnum(passphrase: string): Networks {
  switch (passphrase) {
    case 'Test SDF Network ; September 2015': return Networks.TESTNET;
    case 'Test SDF Future Network ; October 2022': return Networks.FUTURENET;
    case 'Public Global Stellar Network ; September 2015': return Networks.PUBLIC;
    default: return Networks.TESTNET;
  }
}

let initialized = false;

export function initKit(networkPassphrase: string) {
  StellarWalletsKit.init({
    network: networkPassphraseToEnum(networkPassphrase),
    modules: [
      new FreighterModule(),
      new xBullModule(),
      new LobstrModule(),
    ],
  });
  initialized = true;
}

export async function connectWallet(networkPassphrase: string): Promise<{ address: string }> {
  if (!initialized) initKit(networkPassphrase);
  return StellarWalletsKit.authModal();
}

export async function signTx(
  xdr: string,
  networkPassphrase: string,
  address: string
): Promise<string> {
  const { signedTxXdr } = await StellarWalletsKit.signTransaction(xdr, { networkPassphrase, address });
  return signedTxXdr;
}

export async function disconnect() {
  await StellarWalletsKit.disconnect();
}
