#!/bin/bash
# ==============================================================================
# Click Camp Business and Technology Services Limited
# Automated Daily Production Database Backup Script (Step 5 Checklist)
# ==============================================================================

set -e

BACKUP_DIR="${BACKUP_DIR:-/var/backups/clickcamp_db}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="$BACKUP_DIR/clickcamp_prod_$TIMESTAMP.sql.gz"

mkdir -p "$BACKUP_DIR"

echo "[$TIMESTAMP] Starting ClickCamp production database backup..."

# Extract PostgreSQL database dump and compress
PGPASSWORD="${SUPABASE_DB_PASSWORD}" pg_dump \
  -h "${DB_HOST:-db.clickcamp.tech}" \
  -U "${DB_USER:-postgres}" \
  -d "${DB_NAME:-clickcamp_production}" \
  | gzip > "$BACKUP_FILE"

if [ $? -eq 0 ]; then
  echo "[$TIMESTAMP] Backup successfully saved to: $BACKUP_FILE"
  # Retain last 30 daily backups
  find "$BACKUP_DIR" -type f -name "clickcamp_prod_*.sql.gz" -mtime +30 -delete
  echo "[$TIMESTAMP] Old backup archives older than 30 days pruned."
else
  echo "[$TIMESTAMP] ERROR: Database backup failed!" >&2
  exit 1
fi
