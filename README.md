# Vimpact App

Office web app for Vimpact Care. Requires Node.js 22.22.1+ and Bun.

```bash
bun install
cp .env.example .env.development
bun run dev
```

## Scripts

| Command             | Description                  |
| ------------------- | ---------------------------- |
| `bun run dev`       | Local dev server             |
| `bun run build`     | Production build             |
| `bun run lint`      | ESLint                       |
| `bun run lint:fix`  | ESLint with autofix          |
| `bun run fmt`       | Format with Prettier         |
| `bun run fmt:check` | Check formatting             |
| `bun run validate`  | Lint, format check and build |

A Husky pre-commit hook runs lint-staged, then the ggshield secret scan if ggshield is installed.
