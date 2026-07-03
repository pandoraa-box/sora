import type { ParsedType, ParsedUdt } from '@/types';

// Converts a string form value to a native JS value the stellar SDK can accept.
// The SDK's contract.Client methods accept native values and convert to ScVals internally.
export function parseArg(raw: string, type: ParsedType, udts: Record<string, ParsedUdt>): unknown {
  const s = raw.trim();

  switch (type.kind) {
    case 'primitive':
      switch (type.name) {
        case 'bool':
          return s === 'true' || s === '1';
        case 'void':
          return null;
        case 'u32':
        case 'i32':
          return parseInt(s, 10);
        case 'u64':
        case 'i64':
        case 'u128':
        case 'i128':
        case 'u256':
        case 'i256':
          return BigInt(s);
        case 'address':
        case 'string':
        case 'symbol':
        case 'bytes':
        case 'val':
        case 'error':
          return s;
        default:
          return s;
      }

    case 'option':
      if (s === '' || s === 'null' || s === 'undefined') return null;
      return parseArg(s, type.inner, udts);

    case 'vec': {
      try {
        const arr = JSON.parse(s) as unknown[];
        return arr.map((item) => parseArg(JSON.stringify(item), type.element, udts));
      } catch {
        return [];
      }
    }

    case 'map': {
      try {
        const obj = JSON.parse(s) as Record<string, unknown>;
        const entries: [unknown, unknown][] = Object.entries(obj).map(([k, v]) => [
          parseArg(k, type.key, udts),
          parseArg(JSON.stringify(v), type.value, udts),
        ]);
        return new Map(entries);
      } catch {
        return new Map();
      }
    }

    case 'tuple': {
      try {
        const arr = JSON.parse(s) as unknown[];
        return arr.map((item, i) =>
          i < type.elements.length
            ? parseArg(JSON.stringify(item), type.elements[i], udts)
            : item
        );
      } catch {
        return [];
      }
    }

    case 'bytesN':
    case 'udt':
      // For complex types pass raw JSON; the SDK will handle or error gracefully
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }

    case 'result': {
      try {
        return JSON.parse(s);
      } catch {
        return s;
      }
    }

    default:
      return s;
  }
}

export function argsToNative(
  inputs: Array<{ name: string; type: ParsedType }>,
  values: Record<string, string>,
  udts: Record<string, ParsedUdt>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const { name, type } of inputs) {
    result[name] = parseArg(values[name] ?? '', type, udts);
  }
  return result;
}

export function typeLabel(type: ParsedType): string {
  switch (type.kind) {
    case 'primitive': return type.name;
    case 'option': return `Option<${typeLabel(type.inner)}>`;
    case 'vec': return `Vec<${typeLabel(type.element)}>`;
    case 'map': return `Map<${typeLabel(type.key)},${typeLabel(type.value)}>`;
    case 'tuple': return `(${type.elements.map(typeLabel).join(', ')})`;
    case 'bytesN': return `Bytes<${type.n}>`;
    case 'udt': return type.name;
    case 'result': return `Result<${typeLabel(type.ok)},${typeLabel(type.err)}>`;
    default: return 'unknown';
  }
}

export function isJsonType(type: ParsedType): boolean {
  switch (type.kind) {
    case 'vec':
    case 'map':
    case 'tuple':
    case 'bytesN':
    case 'result':
      return true;
    case 'udt':
      return true;
    case 'option':
      return isJsonType(type.inner);
    default:
      return false;
  }
}
