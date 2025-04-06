# !/bin/bash
# sync.binlogs.sh
# Professional script to sync completed binlog folders (marked with .done) to S3.
# Author: [Your Name]
# Date: [Today's Date]

set -euo pipefail

LOCAL_DIR="./binlogs"
AWS_REGION="us-east-1"
S3_BUCKET="marketdata001-dev"
S3_PATH="s3://${S3_BUCKET}/binlogs"
LOG_FILE="/var/log/sync.binlogs.log"

export AWS_DEFAULT_REGION="$AWS_REGION"

aws s3 sync "$LOCAL_DIR" "$S3_PATH" --exact-timestamps

exit 0

