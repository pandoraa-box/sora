export type NetworkName = 'testnet' | 'futurenet' | 'mainnet' | 'custom';

export interface NetworkConfig {
  name: NetworkName;
  label: string;
  rpcUrl: string;
  networkPassphrase: string;
}

export type PrimitiveTypeName =
  | 'bool'
  | 'u32'
  | 'i32'
  | 'u64'
  | 'i64'
  | 'u128'
  | 'i128'
  | 'u256'
  | 'i256'
  | 'bytes'
  | 'string'
  | 'symbol'
  | 'address'
  | 'void'
  | 'val'
  | 'error';

export type ParsedType =
  | { kind: 'primitive'; name: PrimitiveTypeName }
  | { kind: 'option'; inner: ParsedType }
  | { kind: 'vec'; element: ParsedType }
  | { kind: 'map'; key: ParsedType; value: ParsedType }
  | { kind: 'tuple'; elements: ParsedType[] }
  | { kind: 'bytesN'; n: number }
  | { kind: 'udt'; name: string }
  | { kind: 'result'; ok: ParsedType; err: ParsedType };

export interface ParsedParam {
  name: string;
  doc?: string;
  type: ParsedType;
}

export interface ParsedFunction {
  name: string;
  doc?: string;
  inputs: ParsedParam[];
  outputs: ParsedType[];
}

export interface ParsedField {
  name: string;
  doc?: string;
  type: ParsedType;
}

export interface ParsedStruct {
  kind: 'struct';
  name: string;
  doc?: string;
  fields: ParsedField[];
}

export interface ParsedUnionCase {
  name: string;
  doc?: string;
  type?: ParsedType;
}

export interface ParsedUnion {
  kind: 'union';
  name: string;
  doc?: string;
  cases: ParsedUnionCase[];
}

export interface ParsedEnumVariant {
  name: string;
  doc?: string;
  value: number;
}

export interface ParsedEnum {
  kind: 'enum';
  name: string;
  doc?: string;
  variants: ParsedEnumVariant[];
}

export type ParsedUdt = ParsedStruct | ParsedUnion | ParsedEnum;

export interface LoadedContract {
  contractId: string;
  network: NetworkConfig;
  functions: ParsedFunction[];
  udts: Record<string, ParsedUdt>;
}

export interface SavedCall {
  id: string;
  name: string;
  contractId: string;
  network: NetworkName;
  functionName: string;
  args: Record<string, string>;
  createdAt: number;
}

export interface Collection {
  id: string;
  name: string;
  calls: SavedCall[];
  createdAt: number;
}

export type CallStatus = 'idle' | 'simulating' | 'signing' | 'submitting' | 'success' | 'error';

export interface CallResult {
  type: 'simulate' | 'invoke';
  status: 'success' | 'error';
  functionName: string;
  args: Record<string, string>;
  result?: unknown;
  error?: string;
  txHash?: string;
  latencyMs?: number;
  timestamp: number;
}

export interface HistoryEntry extends CallResult {
  id: string;
  contractId: string;
}
