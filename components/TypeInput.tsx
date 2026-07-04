'use client';

import type { ParsedType } from '@/types';
import { typeLabel, isJsonType } from '@/lib/soroban/args';

interface Props {
  name: string;
  type: ParsedType;
  value: string;
  onChange: (v: string) => void;
}

function placeholder(type: ParsedType): string {
  if (type.kind !== 'primitive') {
    if (type.kind === 'option') return `null  or  ${typeLabel(type.inner)}`;
    if (type.kind === 'vec') return `[ ${typeLabel(type.element)}, … ]`;
    if (type.kind === 'map') return `{ "key": value, … }`;
    if (type.kind === 'tuple') return `[ ${type.elements.map(typeLabel).join(', ')} ]`;
    if (type.kind === 'bytesN') return `hex · ${type.n} bytes`;
    if (type.kind === 'udt') return '{ … }';
    return 'JSON value';
  }
  switch (type.name) {
    case 'address': return 'G… or C…';
    case 'u32': case 'u64': case 'i32': case 'i64':
    case 'u128': case 'i128': case 'u256': case 'i256': return '0';
    case 'bytes': return 'hex encoded';
    default: return '';
  }
}

const fieldClass =
  'w-full bg-field border border-edge rounded-lg px-3 py-2 text-sm font-mono text-fg placeholder:text-fg4 focus:border-fg3 focus:outline-none transition-colors';

export function TypeInput({ name, type, value, onChange }: Props) {
  const label = typeLabel(type);
  const isVoid = type.kind === 'primitive' && type.name === 'void';
  const isBool = type.kind === 'primitive' && type.name === 'bool';

  const Header = (
    <div className="flex items-baseline gap-2 mb-1.5">
      <span className="text-sm font-mono text-fg">{name}</span>
      <span className="text-xs font-mono text-fg4">{label}</span>
    </div>
  );

  if (isVoid) {
    return (
      <div className="flex items-center gap-2.5 py-3">
        <span className="text-sm font-mono text-fg3">{name}</span>
        <span className="text-xs font-mono text-fg4">void · no value</span>
      </div>
    );
  }

  if (isBool) {
    return (
      <div>
        {Header}
        <div className="flex gap-2">
          {(['true', 'false'] as const).map((opt) => (
            <button
              key={opt}
              type="button"
              onClick={() => onChange(opt)}
              className={`px-3 py-1.5 text-sm font-mono border rounded-lg transition-colors ${
                value === opt
                  ? 'bg-ink text-paper border-ink'
                  : 'bg-transparent text-fg3 border-edge hover:border-fg3 hover:text-fg2'
              }`}
            >
              {opt}
            </button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      {Header}
      {isJsonType(type) ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder(type)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder(type)}
          className={fieldClass}
        />
      )}
    </div>
  );
}
