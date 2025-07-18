# Scripts Directory

This directory contains utility scripts for the Oyagema project.

## Available Scripts

### `setup-hooks.sh`

Sets up Git hooks for the project, including the pre-commit hook.

**Usage:**
```bash
./scripts/setup-hooks.sh
```

### `check-types.sh`

Checks TypeScript types in the codebase without generating output files.

**Usage:**
```bash
./scripts/check-types.sh
# or
npm run type-check
```

### `pre-commit.sh`

A Git pre-commit hook script that runs type checking and linting before allowing a commit.

**Usage:**
To set up as a Git pre-commit hook:

```bash
# From the project root
ln -sf ../../scripts/pre-commit.sh .git/hooks/pre-commit
chmod +x .git/hooks/pre-commit
```

After setup, the script will run automatically before each commit.

### `create-admin.ts`

Creates an admin user in the database.

**Usage:**
```bash
npm run create-admin
```

## Adding New Scripts

When adding new scripts to this directory:

1. Make sure to make them executable: `chmod +x scripts/your-script.sh`
2. Add a description in this README
3. If applicable, add an npm script in package.json