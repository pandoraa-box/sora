# Sora — Soroban Workbench

A Postman-style developer workbench for [Soroban](https://soroban.stellar.org) smart contracts on the Stellar network. Load any contract by address, inspect its ABI, fill in parameters with type-aware inputs, simulate or invoke functions, and save call sets to reusable collections — all from the browser, with no local tooling required. 

join TG Chanel
https://t.me/+mUl2WidjFcU0NTY0

---

## Features

- **Contract Inspector** — Paste any Soroban contract address and fetch its on-chain ABI (spec) instantly. Browse all exported functions and user-defined types (structs, enums, unions).
- **Type-aware Inputs** — Each function parameter renders the right input control for its type: text fields for primitives, JSON textarea for complex types, toggle buttons for booleans.
- **Simulate & Invoke** — Run read-only simulations without a wallet, or sign and submit on-chain transactions via any Stellar wallet (Freighter, xBull, Albedo, etc.).
- **Response Panel** — Formatted result display with status, latency, and transaction hash. Errors surface the full diagnostic message.
- **Call History** — Every call is persisted locally and listed chronologically in the History tab.
- **Collections / Workspace** — Save named call presets (function + filled arguments) into collections for quick replay.
- **Multi-network** — Testnet, Futurenet, Mainnet, or a custom RPC endpoint with configurable network passphrase.
- **Mobile responsive** — Full three-column layout on desktop; bottom tab navigation (Workspace / Functions / Response) on mobile.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 16 (App Router, Turbopack) |
| UI | React 19, Tailwind CSS v4 |
| State | Zustand v5 |
| Stellar SDK | `@stellar/stellar-sdk` v16 |
| Wallet Kit | `@creit.tech/stellar-wallets-kit` |
| Language | TypeScript 5 |
| Package Manager | pnpm |

---

## Project Structure

```
sora/
├── app/
│   ├── globals.css        # Tailwind v4 @theme tokens, base reset, .metal-strip
│   ├── layout.tsx         # HTML shell, Inter font, metadata
│   └── page.tsx           # Root page — desktop 3-column + mobile tab layout
│
├── components/
│   ├── Header.tsx          # Brand logo, network selector, wallet button
│   ├── ContractLoader.tsx  # Contract address bar (Fetch / Paste / Upload ABI)
│   ├── ContractInspector.tsx # Function nav list + active function panel
│   ├── FunctionPanel.tsx   # Parameter form, Simulate/Invoke actions
│   ├── TypeInput.tsx       # Type-aware argument input (primitive, bool, JSON, etc.)
│   ├── ResponsePanel.tsx   # Right panel — Response tab + History tab
│   ├── ResultPanel.tsx     # Presentational result/error display
│   ├── HistoryPanel.tsx    # Chronological call history list
│   ├── CollectionsSidebar.tsx # Saved call collections (Workspace)
│   ├── NetworkSelector.tsx # Testnet / Futurenet / Mainnet / Custom dropdown
│   ├── WalletButton.tsx    # Connect / disconnect wallet
│   └── StellarLogo.tsx     # Stellar SVG mark
│
├── lib/
│   ├── store.ts            # Zustand store — all shared app state
│   ├── wallet.ts           # connectWallet, signTx, disconnect (wallet kit wrapper)
│   ├── theme.ts            # useTheme hook
│   ├── theme-script.ts     # Inline script to apply dark class before paint
│   ├── soroban/
│   │   ├── client.ts       # loadContract, simulateCall, invokeCall (RPC calls)
│   │   ├── spec-parser.ts  # XDR contract spec → ParsedFunction / ParsedUdt
│   │   ├── args.ts         # argsToNative, typeLabel, isJsonType
│   │   └── networks.ts     # NETWORKS map (testnet, futurenet, mainnet configs)
│   └── storage/
│       └── index.ts        # localStorage wrapper with typed get/set/list/remove
│
├── types/
│   └── index.ts            # All shared TypeScript types
│
└── public/                 # Static assets
```

---

## Architecture

### State Flow

All global state lives in a single Zustand store (`lib/store.ts`). The key design decision is that **call results are stored in the global store** (not local component state), so the `FunctionPanel` (which runs the call) and the `ResponsePanel` (which displays the result) are fully decoupled.

```
User fills params → FunctionPanel calls setCallResult(null, 'loading')
                  → simulateCall / invokeCall (RPC)
                  → setCallResult(entry, 'success' | 'error')
                  → pushHistory(entry)

ResponsePanel reads callResult + callStatus from store → renders ResultPanel
```

### Contract Loading

```
ContractLoader → loadContract(contractId, network)
              → contract.Client.from({ contractId, rpcUrl, networkPassphrase })
              → spec-parser: XDR entries → ParsedFunction[], Record<string, ParsedUdt>
              → setContract(loaded) in store
              → ContractInspector renders fn list, auto-selects first function
```

### Soroban Type System

The `ParsedType` union covers every type in the Soroban spec:

- **Primitives** — `bool`, `u32`, `i32`, `u64`, `i64`, `u128`, `i128`, `u256`, `i256`, `bytes`, `string`, `symbol`, `address`, `void`
- **Compound** — `option<T>`, `vec<T>`, `map<K, V>`, `tuple<...T>`, `bytesN`
- **User-defined** — `udt` (resolved to struct / union / enum from the ABI)
- **Result** — `result<Ok, Err>`

`TypeInput` renders the correct form control for each type. `argsToNative` converts filled string values back to the native JS types that the Stellar SDK expects.

### Layout

```
┌─ Header ──────────────────────────────────────────────────────┐
├─ ContractLoader ──────────────────────────────────────────────┤
│                                                               │
│ Desktop (≥ lg):                                               │
│ ┌─ w-56 ──────┬─────────────────────────┬─ w-80 ───────────┐ │
│ │ Workspace   │  ContractInspector      │  ResponsePanel   │ │
│ │ Collections │  ├─ w-48 fn list        │  ├─ Response tab │ │
│ │             │  └─ FunctionPanel       │  └─ History tab  │ │
│ └─────────────┴─────────────────────────┴──────────────────┘ │
│                                                               │
│ Mobile (< lg):   content area + bottom tab bar               │
│                  [ Workspace | Functions | Response ]         │
└───────────────────────────────────────────────────────────────┘
```

### Design Tokens

Sora uses Tailwind CSS v4's `@theme` block in `globals.css` to define all design tokens as CSS custom properties. This makes every token available as a Tailwind utility class.

| Class | Value | Usage |
|---|---|---|
| `bg-surface` | `#0d1117` | Page background |
| `bg-panel` | `#161b22` | Sidebar, header, panels |
| `bg-raised` | `#21262d` | Hover and selected states |
| `bg-field` | `#0d1117` | Input backgrounds |
| `text-ink` / `bg-ink` | `#2563eb` | Primary blue accent |
| `text-fg` | `#e6edf3` | Primary text |
| `text-fg2` | `#8b949e` | Secondary text |
| `text-fg3` | `#6e7681` | Muted text |
| `text-fg4` | `#484f58` | Placeholders, very muted |
| `border-edge` | `#21262d` | Main borders |
| `border-subtle` | `#1c2128` | Subtle dividers |

---

## Getting Started

### Prerequisites

- Node.js 18+
- pnpm (`npm install -g pnpm`)

### Install & Run

```bash
# Install dependencies
pnpm install

# Start the dev server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000).

### Using the App

1. **Select a network** — Choose Testnet, Futurenet, Mainnet, or enter a custom RPC URL from the header dropdown.
2. **Load a contract** — Paste a Soroban contract address (starts with `C`) into the search bar and click **Fetch ABI**.
3. **Select a function** — Click any function in the left nav to open its parameter form.
4. **Fill parameters** — Each input is typed to match the contract spec. Complex types (vecs, maps, structs) accept JSON.
5. **Simulate or Invoke** — Click **Simulate** to run a read-only call with no wallet required. Click **Invoke** to sign and submit a transaction (requires a connected wallet).
6. **View the response** — Results appear in the Response panel on the right (or the Response tab on mobile).
7. **Save calls** — Click **save** in the action bar to store the current function + arguments to a collection in the Workspace sidebar.

### Build for Production

```bash
pnpm build
pnpm start
```

---

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

## License

See [LICENSE](LICENSE).
