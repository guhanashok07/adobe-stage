#!/usr/bin/env bash
# Snapshot this repository into a single-file git bundle stored OUTSIDE the
# repo, plus a copy of anything git does not track.
#
# A bundle holds every branch, tag and commit in one file. Restoring is:
#   git clone <bundle-file> recovered-repo
#
# Run before anything that rewrites or removes history, and whenever you want
# a checkpoint:
#   ./scripts/backup.sh
set -euo pipefail

REPO_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPO_NAME="$(basename "$REPO_DIR")"
BACKUP_DIR="${STAGE_BACKUP_DIR:-$HOME/Backups/git-bundles}"
STAMP="$(date +%Y-%m-%d_%H%M%S)"
DEST="$BACKUP_DIR/$REPO_NAME"

mkdir -p "$DEST"
cd "$REPO_DIR"

BUNDLE="$DEST/${REPO_NAME}_${STAMP}.bundle"
git bundle create "$BUNDLE" --all >/dev/null 2>&1

# Untracked, non-ignored files are not in the bundle; capture them too.
EXTRA="$(git ls-files --others --exclude-standard)"
if [ -n "$EXTRA" ]; then
  printf '%s\n' "$EXTRA" | tar -czf "$DEST/${REPO_NAME}_${STAMP}_untracked.tar.gz" -T - 2>/dev/null || true
fi

# Keep the 20 most recent bundles.
ls -1t "$DEST"/*.bundle 2>/dev/null | tail -n +21 | xargs -r rm --

echo "Backed up to: $BUNDLE"
echo "  size:     $(du -h "$BUNDLE" | cut -f1)"
echo "  branches: $(git for-each-ref --format='%(refname:short)' refs/heads | tr '\n' ' ')"
echo "  restore:  git clone \"$BUNDLE\" recovered-$REPO_NAME"
