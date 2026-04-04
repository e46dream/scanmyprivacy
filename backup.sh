#!/bin/bash

# ScanMyPrivacy Backup Manager
# Like VSS - Create checkpoints before major changes

PROJECT_DIR="/home/sunil/Documents/Sunil/Trades/Test_Sandbox/IP_Project/scanmyprivacy"
cd "$PROJECT_DIR" || exit 1

show_help() {
    echo "ScanMyPrivacy Backup Manager"
    echo ""
    echo "Usage: ./backup.sh [command] [message]"
    echo ""
    echo "Commands:"
    echo "  backup <msg>     - Create a new backup checkpoint with log entry"
    echo "  list             - List all backup checkpoints"
    echo "  log              - View detailed backup log database"
    echo "  restore <hash>   - Restore to specific checkpoint"
    echo "  restore-last     - Restore to last checkpoint"
    echo "  status           - Show current status"
    echo "  diff             - Show changes since last backup"
    echo ""
    echo "Examples:"
    echo "  ./backup.sh backup 'Adding payment integration'"
    echo "  ./backup.sh list"
    echo "  ./backup.sh log"
    echo "  ./backup.sh restore 0f83833"
    echo "  ./backup.sh restore-last"
}

create_backup() {
    local msg="${1:-Backup checkpoint}"
    local timestamp=$(date +%Y-%m-%d\ %H:%M:%S)
    local short_time=$(date +%Y%m%d-%H%M%S)
    local backup_num=$(git rev-list --count HEAD 2>/dev/null)
    backup_num=$((backup_num + 1))
    local backup_id=$(printf "BACKUP-%03d" $backup_num)
    
    echo "Creating $backup_id..."
    git add -A
    git commit -m "[$backup_id] $msg

Timestamp: $timestamp" 2>/dev/null
    
    if [ $? -eq 0 ]; then
        local hash=$(git rev-parse --short HEAD)
        local files_changed=$(git diff-tree --no-commit-id --name-only -r HEAD | wc -l)
        
        # Log to backup database
        cat >> BACKUP_LOG.db << EOF

#===============================================================================
# $backup_id: $msg
#===============================================================================
ID: $backup_id
TIMESTAMP: $timestamp
GIT_HASH: $hash
AUTHOR: $(git config user.name)
TAGS: ENHANCEMENT

CHANGES:
  [ADDED] $msg
  
FILES_AFFECTED: $files_changed files
  $(git diff-tree --no-commit-id --name-only -r HEAD | sed 's/^/  - /')

RESTORE_CMD: git reset --hard $hash

STATUS: ACTIVE

NOTES: |
  Backup created at $timestamp
  Commit hash: $hash
  Files changed: $files_changed
  
  TO RESTORE:
    bash backup.sh restore $hash

#===============================================================================
EOF
        
        echo "✅ $backup_id created successfully!"
        echo "   Hash: $hash"
        echo "   Time: $timestamp"
        echo "   Files: $files_changed"
        echo "   Log: BACKUP_LOG.db"
    else
        echo "❌ No changes to backup or commit failed"
    fi
}

list_backups() {
    echo "Backup Checkpoints:"
    echo "=================="
    git log --oneline --all -20 | nl
    echo ""
    echo "To restore: ./backup.sh restore <hash>"
}

restore_backup() {
    local hash="$1"
    if [ -z "$hash" ]; then
        echo "❌ Error: No backup hash provided"
        exit 1
    fi
    
    echo "⚠️  WARNING: This will restore to checkpoint $hash"
    echo "⚠️  Current uncommitted changes will be lost!"
    read -p "Continue? (yes/no): " confirm
    
    if [ "$confirm" = "yes" ]; then
        git reset --hard "$hash"
        echo "✅ Restored to checkpoint $hash"
        echo "   Run 'npm install' if needed"
    else
        echo "Cancelled."
    fi
}

restore_last() {
    echo "Restoring to last checkpoint..."
    git reset --hard HEAD~1
    echo "✅ Restored to previous checkpoint"
}

show_status() {
    echo "Current Status:"
    echo "==============="
    echo "Current commit: $(git rev-parse --short HEAD)"
    echo "Total backups: $(git rev-list --count HEAD)"
    echo ""
    echo "Uncommitted changes:"
    git status --short
}

show_diff() {
    echo "Changes since last backup:"
    echo "========================="
    git diff HEAD
}

# Main
case "${1:-help}" in
    backup|b)
        shift
        create_backup "$@"
        ;;
    list|l)
        list_backups
        ;;
    log)
        echo "Backup Log Database:"
        echo "===================="
        cat BACKUP_LOG.db 2>/dev/null || echo "No backup log found. Create a backup first."
        ;;
    restore|r)
        restore_backup "$2"
        ;;
    restore-last|rl)
        restore_last
        ;;
    status|s)
        show_status
        ;;
    diff|d)
        show_diff
        ;;
    help|h|*)
        show_help
        ;;
esac
