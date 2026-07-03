import type { NetworkConfig } from '@/types';

// Mainnet RPC requires an API key from a provider (e.g. validationcloud.io, nownodes.io).
// Set NEXT_PUBLIC_MAINNET_RPC_URL in your .env.local to use your own endpoint.
const MAINNET_RPC =
  process.env.NEXT_PUBLIC_MAINNET_RPC_URL ??
  'https://mainnet.stellar.validationcloud.io/v1/';

export const NETWORKS: Record<string, NetworkConfig> = {
  testnet: {
    name: 'testnet',
    label: 'Testnet',
    rpcUrl: 'https://soroban-testnet.stellar.org',
    networkPassphrase: 'Test SDF Network ; September 2015',
  },
  futurenet: {
    name: 'futurenet',
    label: 'Futurenet',
    rpcUrl: 'https://rpc-futurenet.stellar.org',
    networkPassphrase: 'Test SDF Future Network ; October 2022',
  },
  mainnet: {
    name: 'mainnet',
    label: 'Mainnet',
    rpcUrl: MAINNET_RPC,
    networkPassphrase: 'Public Global Stellar Network ; September 2015',
  },
};

export const DEFAULT_NETWORK = NETWORKS.testnet;
