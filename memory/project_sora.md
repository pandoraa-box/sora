---
name: project-sora
description: Architecture, tech stack, design system, and key files for the Sora Soroban workbench app
metadata:
  type: project
---

# Sora — Soroban Workbench

Postman-style workbench for Soroban (Stellar) smart contracts. Lets users load a contract by address, inspect its ABI, fill function params, simulate or invoke calls, and save call sets to collections.

**Why:** User is building this as an EVM-agnostic Postman equivalent for Soroban devs.
**How to apply:** Respect the ForgeBase-inspired dark design; keep things minimal and functional.

## Stack

- Next.js 16 (App Router, Turbopack, `use client` page)
- React 19, TypeScript 5
- Tailwind CSS v4 (via `@tailwindcss/postcss`) — tokens defined in `@theme` block in `globals.css`
- Zustand v5 for state
- `@stellar/stellar-sdk` v16 for Soroban RPC, XDR spec parsing
- `@creit.tech/stellar-wallets-kit` for wallet connections

## Design System (Tailwind v4 `@theme` tokens)

All in `app/globals.css`:

| Token | Hex | Use |
|-------|-----|-----|
| `--color-surface` | `#0d1117` | page background |
| `--color-panel` | `#161b22` | sidebar/header/panels |
| `--color-raised` | `#21262d` | hover/selected states |
| `--color-field` | `#0d1117` | input backgrounds |
| `--color-ink` | `#2563eb` | primary accent (blue) |
| `--color-paper` | `#f0f6fc` | text on ink-colored bg |
| `--color-fg` | `#e6edf3` | primary text |
| `--color-fg2` | `#8b949e` | secondary text |
| `--color-fg3` | `#6e7681` | muted text |
| `--color-fg4` | `#484f58` | very muted / placeholders |
| `--color-edge` | `#21262d` | dark borders |
| `--color-subtle` | `#1c2128` | very subtle borders |

`.metal-strip` — CSS class for subtle top-edge gradient on toolbar strips.

## Layout (ForgeBase-inspired)

```
┌─ Header (h-14): brand logo | network selector | connect wallet ──────────┐
├─ ContractLoader: search input | Fetch ABI | Paste ABI* | Upload ABI* ────┤
│  Desktop (lg+): 3 fixed columns                                           │
│  ┌ w-56 sidebar ──┬─ flex-1 center ──────────────┬─ w-80 response panel ┐│
│  │ CollectionsSidebar│  ContractInspector          │  ResponsePanel       ││
│  │ (Workspace)    │  ├ w-48 fn list               │  ├ Response tab       ││
│  │                │  └ fn panel (FunctionPanel)    │  └ History tab       ││
│  └────────────────┴─────────────────────────────────┴───────────────────┘│
│  Mobile (< lg): tab bar at bottom (Workspace | Functions | Response)      │
└──────────────────────────────────────────────────────────────────────────┘
```

*Paste ABI / Upload ABI are UI-only buttons (disabled, coming soon).

## Key Files

- `app/globals.css` — Tailwind @theme tokens + body reset + .metal-strip
- `app/layout.tsx` — html/body shell, Inter font
- `app/page.tsx` — desktop 3-column + mobile tab layout
- `components/Header.tsx` — brand + network selector + wallet button
- `components/ContractLoader.tsx` — contract address bar
- `components/ContractInspector.tsx` — fn list nav (w-48) + fn panel
- `components/FunctionPanel.tsx` — params form + Simulate/Invoke buttons; writes result to store (`setCallResult`)
- `components/ResponsePanel.tsx` — tabs: Response (ResultPanel) + History
- `components/ResultPanel.tsx` — presentational result display, reads `result`/`status` props
- `components/CollectionsSidebar.tsx` — saved call collections (Workspace)
- `components/HistoryPanel.tsx` — chronological call history
- `components/NetworkSelector.tsx` — testnet/futurenet/mainnet/custom dropdown
- `components/WalletButton.tsx` — connect/disconnect FreighterKit wallet
- `components/TypeInput.tsx` — type-aware Soroban argument inputs
- `lib/store.ts` — Zustand store; `callResult`/`callStatus` in store (not local state) so ResponsePanel can read them
- `lib/soroban/client.ts` — `loadContract`, `simulateCall`, `invokeCall`
- `lib/soroban/spec-parser.ts` — XDR spec → ParsedFunction / ParsedUdt
- `lib/soroban/networks.ts` — NETWORKS map (testnet, futurenet, mainnet)
- `lib/soroban/args.ts` — `argsToNative`, `typeLabel`, `isJsonType`
- `lib/wallet.ts` — `connectWallet`, `signTx`, `disconnect`
- `lib/storage/` — localStorage wrapper with KEYS helpers
- `types/index.ts` — all shared TypeScript types
