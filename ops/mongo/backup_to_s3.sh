#!/usr/bin/env bash
set -euo pipefail

# Backup MongoDB to S3 using mongodump.
#
# Required env:
# - MONGODB_URI
# - S3_BUCKET
# - AWS_REGION (optional)
#
# Optional:
# - S3_PREFIX (default: aura-backups)

if [[ -z "${MONGODB_URI:-}" ]]; then
  echo "MONGODB_URI is required" >&2
  exit 1
fi
if [[ -z "${S3_BUCKET:-}" ]]; then
  echo "S3_BUCKET is required" >&2
  exit 1
fi

PREFIX="${S3_PREFIX:-aura-backups}"
REGION="${AWS_REGION:-}"

TS="$(date -u +%Y%m%dT%H%M%SZ)"
NAME="mongo-${TS}.archive.gz"
TMP="/tmp/${NAME}"

echo "Creating mongodump archive..."
mongodump --uri="${MONGODB_URI}" --archive="${TMP}" --gzip

DEST="s3://${S3_BUCKET}/${PREFIX}/${NAME}"
echo "Uploading to ${DEST} ..."
if [[ -n "${REGION}" ]]; then
  aws s3 cp "${TMP}" "${DEST}" --region "${REGION}"
else
  aws s3 cp "${TMP}" "${DEST}"
fi

rm -f "${TMP}"
echo "Backup complete."

