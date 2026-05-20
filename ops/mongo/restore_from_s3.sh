#!/usr/bin/env bash
set -euo pipefail

# Restore MongoDB from an S3 archive created by backup_to_s3.sh.
#
# Usage:
#   ./restore_from_s3.sh s3://bucket/prefix/mongo-YYYY...archive.gz
#
# Required env:
# - MONGODB_URI

SRC="${1:-}"
if [[ -z "${SRC}" ]]; then
  echo "Usage: $0 s3://bucket/key" >&2
  exit 1
fi
if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is required" >&2
  exit 1
fi

TMP="/tmp/restore.archive.gz"
echo "Downloading ${SRC} ..."
aws s3 cp "${SRC}" "${TMP}"

echo "Restoring to MongoDB (this will overwrite collections in target DB) ..."
mongorestore --uri="${MONGODB_URI}" --archive="${TMP}" --gzip --drop

rm -f "${TMP}"
echo "Restore complete."

