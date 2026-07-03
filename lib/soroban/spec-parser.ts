import { xdr } from '@stellar/stellar-sdk';
import type {
  ParsedType,
  ParsedFunction,
  ParsedParam,
  ParsedField,
  ParsedUdt,
  ParsedStruct,
  ParsedUnion,
  ParsedEnum,
} from '@/types';

function parseType(t: xdr.ScSpecTypeDef): ParsedType {
  const name = t.switch().name as string;
  switch (name) {
    case 'scSpecTypeBool': return { kind: 'primitive', name: 'bool' };
    case 'scSpecTypeVoid': return { kind: 'primitive', name: 'void' };
    case 'scSpecTypeError': return { kind: 'primitive', name: 'error' };
    case 'scSpecTypeU32': return { kind: 'primitive', name: 'u32' };
    case 'scSpecTypeI32': return { kind: 'primitive', name: 'i32' };
    case 'scSpecTypeU64': return { kind: 'primitive', name: 'u64' };
    case 'scSpecTypeI64': return { kind: 'primitive', name: 'i64' };
    case 'scSpecTypeTimepoint': return { kind: 'primitive', name: 'u64' };
    case 'scSpecTypeDuration': return { kind: 'primitive', name: 'u64' };
    case 'scSpecTypeU128': return { kind: 'primitive', name: 'u128' };
    case 'scSpecTypeI128': return { kind: 'primitive', name: 'i128' };
    case 'scSpecTypeU256': return { kind: 'primitive', name: 'u256' };
    case 'scSpecTypeI256': return { kind: 'primitive', name: 'i256' };
    case 'scSpecTypeBytes': return { kind: 'primitive', name: 'bytes' };
    case 'scSpecTypeString': return { kind: 'primitive', name: 'string' };
    case 'scSpecTypeSymbol': return { kind: 'primitive', name: 'symbol' };
    case 'scSpecTypeAddress': return { kind: 'primitive', name: 'address' };
    case 'scSpecTypeVal': return { kind: 'primitive', name: 'val' };
    case 'scSpecTypeOption': {
      const inner = t.option().valueType();
      return { kind: 'option', inner: parseType(inner) };
    }
    case 'scSpecTypeResult': {
      const res = t.result();
      return { kind: 'result', ok: parseType(res.okType()), err: parseType(res.errorType()) };
    }
    case 'scSpecTypeVec': {
      const vec = t.vec();
      return { kind: 'vec', element: parseType(vec.elementType()) };
    }
    case 'scSpecTypeMap': {
      const map = t.map();
      return { kind: 'map', key: parseType(map.keyType()), value: parseType(map.valueType()) };
    }
    case 'scSpecTypeTuple': {
      const tup = t.tuple();
      return { kind: 'tuple', elements: tup.valueTypes().map(parseType) };
    }
    case 'scSpecTypeBytesN': {
      const bn = t.bytesN();
      return { kind: 'bytesN', n: bn.n() };
    }
    case 'scSpecTypeUdt': {
      const udt = t.udt();
      return { kind: 'udt', name: udt.name().toString() };
    }
    default:
      return { kind: 'primitive', name: 'val' };
  }
}

function parseDoc(buf: Buffer | { toString(): string }): string | undefined {
  const s = buf.toString().trim();
  return s.length > 0 ? s : undefined;
}

export function parseFunctions(entries: xdr.ScSpecEntry[]): ParsedFunction[] {
  const funcs: ParsedFunction[] = [];
  for (const entry of entries) {
    if (entry.switch().name !== 'scSpecEntryFunctionV0') continue;
    const fn = entry.functionV0();
    const inputs: ParsedParam[] = fn.inputs().map((inp) => ({
      name: inp.name().toString(),
      doc: parseDoc(inp.doc()),
      type: parseType(inp.type()),
    }));
    const outputs: ParsedType[] = fn.outputs().map(parseType);
    funcs.push({
      name: fn.name().toString(),
      doc: parseDoc(fn.doc()),
      inputs,
      outputs,
    });
  }
  return funcs;
}

export function parseUdts(entries: xdr.ScSpecEntry[]): Record<string, ParsedUdt> {
  const udts: Record<string, ParsedUdt> = {};

  for (const entry of entries) {
    const entryName = entry.switch().name as string;

    if (entryName === 'scSpecEntryUdtStructV0') {
      const s = entry.udtStructV0();
      const struct: ParsedStruct = {
        kind: 'struct',
        name: s.name().toString(),
        doc: parseDoc(s.doc()),
        fields: s.fields().map((f) => ({
          name: f.name().toString(),
          doc: parseDoc(f.doc()),
          type: parseType(f.type()),
        } as ParsedField)),
      };
      udts[struct.name] = struct;
    } else if (entryName === 'scSpecEntryUdtUnionV0') {
      const u = entry.udtUnionV0();
      const union: ParsedUnion = {
        kind: 'union',
        name: u.name().toString(),
        doc: parseDoc(u.doc()),
        cases: u.cases().map((c) => {
          const caseName = c.switch().name as string;
          if (caseName === 'scSpecUdtUnionCaseTupleV0') {
            const tup = c.tupleCase();
            const types = tup.type();
            return {
              name: tup.name().toString(),
              doc: parseDoc(tup.doc()),
              type: types.length > 1
                ? { kind: 'tuple' as const, elements: types.map(parseType) }
                : types.length === 1
                  ? parseType(types[0])
                  : undefined,
            };
          } else {
            const v = c.voidCase();
            return {
              name: v.name().toString(),
              doc: parseDoc(v.doc()),
            };
          }
        }),
      };
      udts[union.name] = union;
    } else if (entryName === 'scSpecEntryUdtEnumV0') {
      const e = entry.udtEnumV0();
      const enumType: ParsedEnum = {
        kind: 'enum',
        name: e.name().toString(),
        doc: parseDoc(e.doc()),
        variants: e.cases().map((c) => ({
          name: c.name().toString(),
          doc: parseDoc(c.doc()),
          value: c.value(),
        })),
      };
      udts[enumType.name] = enumType;
    } else if (entryName === 'scSpecEntryUdtErrorEnumV0') {
      const e = entry.udtErrorEnumV0();
      const enumType: ParsedEnum = {
        kind: 'enum',
        name: e.name().toString(),
        doc: parseDoc(e.doc()),
        variants: e.cases().map((c) => ({
          name: c.name().toString(),
          doc: parseDoc(c.doc()),
          value: c.value(),
        })),
      };
      udts[enumType.name] = enumType;
    }
  }

  return udts;
}
