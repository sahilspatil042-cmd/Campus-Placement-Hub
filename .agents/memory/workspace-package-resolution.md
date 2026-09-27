---
name: Workspace package resolution
description: Environment-specific behavior when checking JavaScript dependencies in this pnpm workspace.
---

When debugging an artifact dependency, prefer its declared package scripts or the running bundled service over an ad-hoc `node` command from the workspace root. Direct module resolution can fail even when the artifact itself builds and runs because dependencies are linked within the pnpm workspace layout.

**Why:** A bcrypt/database verification attempt from the workspace root failed with module-resolution errors even though the API artifact had the packages and its managed workflow was healthy.

**How to apply:** Run the artifact's `typecheck`, `build`, and workflow commands first. For one-off checks, invoke a dependency through its package's installed path or use the application's own endpoint instead of assuming root-level Node resolution.