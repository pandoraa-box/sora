'use client';

import { useEffect, useRef, useState } from 'react';
import type { ParsedType } from '@/types';
import { typeLabel, isJsonType } from '@/lib/soroban/args';

interface Props {
  name: string;
  type: ParsedType;
  value: string;
  onChange: (v: string) => void;
  bare?: boolean;
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

const boxClass = 'border border-edge rounded-lg bg-field p-2 space-y-1.5';

const toggleClass =
  'shrink-0 px-1.5 py-0.5 text-xs font-mono text-fg4 border border-edge rounded-md hover:text-fg hover:border-fg3 transition-colors';

const addClass =
  'w-full py-1.5 text-xs font-mono text-fg3 border border-dashed border-edge rounded-md hover:text-fg hover:border-fg3 transition-colors';

const removeClass =
  'shrink-0 mt-1.5 px-1.5 py-0.5 text-xs font-mono text-fg4 hover:text-red-400 transition-colors';

// Convert a row's string form back into a JSON value.
// Valid JSON (numbers, nested arrays, "null", quoted strings) is kept as-is;
// anything else (plain text, hex, addresses) is embedded as a raw string.
function toJsonValue(s: string): unknown {
  try {
    return JSON.parse(s.trim());
  } catch {
    return s;
  }
}

function vecRowsFromValue(value: string): string[] {
  if (!value.trim()) return [];
  try {
    const arr = JSON.parse(value);
    if (Array.isArray(arr)) {
      return arr.map((item) =>
        typeof item === 'string' ? item : JSON.stringify(item)
      );
    }
  } catch {
    /* not parseable — fall through to empty rows */
  }
  return [];
}

function serializeVec(items: string[]): string {
  return JSON.stringify(items.map(toJsonValue).filter((v) => v !== ''));
}

type MapRow = [string, string];

function mapRowsFromValue(value: string): MapRow[] {
  if (!value.trim()) return [];
  try {
    const obj = JSON.parse(value);
    if (obj && typeof obj === 'object' && !Array.isArray(obj)) {
      return Object.entries(obj).map(([k, v]) => [
        k,
        typeof v === 'string' ? v : JSON.stringify(v),
      ]);
    }
  } catch {
    /* not parseable — fall through to empty rows */
  }
  return [];
}

function serializeMap(rows: MapRow[]): string {
  const entries = rows
    .filter(([k, v]) => k.trim() !== '' && v.trim() !== '')
    .map(([k, v]) => [k, toJsonValue(v)] as const);
  return JSON.stringify(Object.fromEntries(entries));
}

// Keeps row state in sync with the controlled `value` from the parent.
// Locally emitted values are remembered so the parent's echo does not reset
// the rows mid-editing; only external changes re-derive the rows.
function useRows<T>(value: string, parse: (v: string) => T[]) {
  const [rows, setRows] = useState<T[]>(() => parse(value));
  const echoed = useRef<string | null>(null);

  useEffect(() => {
    if (echoed.current !== value) setRows(parse(value));
    echoed.current = null;
  }, [value, parse]);

  return {
    rows,
    emit: (next: string, nextRows: T[]) => {
      echoed.current = next;
      setRows(nextRows);
    },
  };
}

type VecInputProps = Props & { type: Extract<ParsedType, { kind: 'vec' }> };

function VecInput({ name, type, value, onChange, bare }: VecInputProps) {
  const element = type.element;
  const [mode, setMode] = useState<'rows' | 'json'>('rows');
  const { rows, emit } = useRows(value, vecRowsFromValue);

  return (
    <div className={boxClass}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          {!bare && <span className="text-sm font-mono text-fg truncate">{name}</span>}
          <span className="text-xs font-mono text-fg4">{typeLabel(type)}</span>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === 'rows' ? 'json' : 'rows')}
          className={toggleClass}
          title={mode === 'rows' ? 'Edit raw JSON' : 'Edit as rows'}
        >
          ⇄
        </button>
      </div>

      {mode === 'rows' ? (
        <>
          {rows.map((item, i) => (
            <div key={i} className="flex items-start gap-2">
              <span className="w-7 shrink-0 pt-2 text-right text-xs font-mono text-fg4">
                [{i}]
              </span>
              <div className="flex-1 min-w-0">
                <TypeInput
                  name={`[${i}]`}
                  type={element}
                  value={item}
                  onChange={(v) =>
                    emit(
                      serializeVec(rows.map((it, j) => (j === i ? v : it))),
                      rows.map((it, j) => (j === i ? v : it))
                    )
                  }
                  bare
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = rows.filter((_, j) => j !== i);
                  emit(serializeVec(next), next);
                }}
                className={removeClass}
                title="Remove item"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => emit(serializeVec([...rows, '']), [...rows, ''])}
            className={addClass}
          >
            + Add item
          </button>
        </>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder(type)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      )}
    </div>
  );
}

type MapInputProps = Props & { type: Extract<ParsedType, { kind: 'map' }> };

function MapInput({ name, type, value, onChange, bare }: MapInputProps) {
  const keyType = type.key;
  const valueType = type.value;
  const [mode, setMode] = useState<'rows' | 'json'>('rows');
  const { rows, emit } = useRows(value, mapRowsFromValue);

  return (
    <div className={boxClass}>
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-baseline gap-2 min-w-0">
          {!bare && <span className="text-sm font-mono text-fg truncate">{name}</span>}
          <span className="text-xs font-mono text-fg4">{typeLabel(type)}</span>
        </div>
        <button
          type="button"
          onClick={() => setMode(mode === 'rows' ? 'json' : 'rows')}
          className={toggleClass}
          title={mode === 'rows' ? 'Edit raw JSON' : 'Edit as rows'}
        >
          ⇄
        </button>
      </div>

      {mode === 'rows' ? (
        <>
          {rows.map(([k, v], i) => (
            <div key={i} className="flex items-start gap-2">
              <div className="flex-1 min-w-0">
                <TypeInput
                  name={`key ${i}`}
                  type={keyType}
                  value={k}
                  onChange={(nk) => {
                    const next: MapRow[] = rows.map((row, j) => (j === i ? [nk, row[1]] : row));
                    emit(serializeMap(next), next);
                  }}
                  bare
                />
              </div>
              <span className="shrink-0 pt-2 text-fg4">→</span>
              <div className="flex-1 min-w-0">
                <TypeInput
                  name={`value ${i}`}
                  type={valueType}
                  value={v}
                  onChange={(nv) => {
                    const next: MapRow[] = rows.map((row, j) => (j === i ? [row[0], nv] : row));
                    emit(serializeMap(next), next);
                  }}
                  bare
                />
              </div>
              <button
                type="button"
                onClick={() => {
                  const next = rows.filter((_, j) => j !== i);
                  emit(serializeMap(next), next);
                }}
                className={removeClass}
                title="Remove entry"
              >
                ✕
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const next: MapRow[] = [...rows, ['', '']];
              emit(serializeMap(next), next);
            }}
            className={addClass}
          >
            + Add entry
          </button>
        </>
      ) : (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder(type)}
          rows={3}
          className={`${fieldClass} resize-none`}
        />
      )}
    </div>
  );
}

export function TypeInput({ name, type, value, onChange, bare }: Props) {
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
        {!bare && Header}
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

  if (type.kind === 'vec') {
    return <VecInput name={name} type={type} value={value} onChange={onChange} bare={bare} />;
  }

  if (type.kind === 'map') {
    return <MapInput name={name} type={type} value={value} onChange={onChange} bare={bare} />;
  }

  return (
    <div>
      {!bare && Header}
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
