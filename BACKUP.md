# ScanMyPrivacy - Backup System

Like VSS (Visual SourceSafe) - Create checkpoints before major changes

## Quick Start

```bash
# See all backup commands
./backup.sh

# Create a backup before making changes
./backup.sh backup "Adding payment integration"

# List all backups
./backup.sh list

# Restore to specific checkpoint
./backup.sh restore 0f83833

# Restore to last checkpoint (undo last change)
./backup.sh restore-last
```

## Workflow Example

```bash
# 1. Create backup before major enhancement
./backup.sh backup "Before adding Shopify integration"

# 2. Make your changes...
# ... edit files ...

# 3. If something goes wrong, restore:
./backup.sh restore-last

# 4. Or restore to specific checkpoint:
./backup.sh list
./backup.sh restore a1b2c3d
```

## Backup Checkpoints History

- **[BACKUP-1]** Initial ScanMyPrivacy platform - Hybrid B2C+B2B
  - Hash: `0f83833`
  - Features: Homepage, Personal scanner, Website compliance, Pricing

## Manual Git Commands

If you prefer using git directly:

```bash
# Create backup
git add -A
git commit -m "[BACKUP-X] Description"

# List backups
git log --oneline

# Restore
git reset --hard <hash>

# See what changed
git diff HEAD
```

## Important Notes

- Each backup is a full snapshot of your code
- Backups are stored locally in the `.git` folder
- You can restore to ANY previous backup instantly
- Uncommitted changes will be lost when restoring
