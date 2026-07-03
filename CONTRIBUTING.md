# Contributing to Sora

Thank you for helping build Sora — the Postman-style workbench for Soroban smart contracts.

## Quick start

```bash
git clone https://github.com/your-org/sora.git
cd sora
pnpm install
cp .env.example .env.local   # add your mainnet RPC key if needed
pnpm dev
```

## Project structure

```
app/          Next.js App Router pages and layout
components/   UI components
lib/
  soroban/    SDK layer — spec parsing, tx build/simulate/invoke
  storage/    localStorage persistence adapter
  theme.ts    Light/dark mode hook
  store.ts    Zustand global state
types/        Shared TypeScript types
```

## Dev workflow

| Command | What it does |
|---|---|
| `pnpm dev` | Start local dev server at `localhost:3000` |
| `pnpm build` | Production build |
| `pnpm lint` | ESLint check |
| `pnpm tsc --noEmit` | TypeScript check |

## Commit style

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add export to JSON for collections
fix: handle void return type in result panel
chore: bump stellar-sdk to v16.1
```

## Pull requests

- PRs should reference the issue they close: `Closes #N` in the body.
- Keep PRs focused — one logical change per PR.
- Run `pnpm lint && pnpm tsc --noEmit` before opening.
- The SDK layer (`lib/soroban/`) is isolated from React — changes there should be independently testable.

## Architecture decisions

- **No backend.** Everything runs client-side. Keys never leave the wallet extension.
- **Persistence adapter.** Collections and history go through `lib/storage/index.ts` only — swap to a real backend by replacing that file.
- **Type system.** `ParsedType` in `types/index.ts` is the canonical Soroban type representation. The spec parser converts XDR → `ParsedType`; the form renderer converts `ParsedType` → inputs; `argsToNative` converts form strings → SDK-compatible values.

## Good first issues

Look for issues labelled `good first issue` or `help wanted` on GitHub.

## License

MIT — see [LICENSE](./LICENSE).
