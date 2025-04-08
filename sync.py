from pathlib import Path
from datetime import datetime, timedelta
import os

def aws_sync_s3():
    response = os.system(f"aws s3 sync ./staging s3://{S3_BUCKET}/binlogs/staging --exact-timestamps --region {AWS_REGION}")
    print("Sync successful" if response == 0 else "Sync failed")

def main():
    format = "%Y-%m-%d/%H/%M/"
    current_date_time_obj = datetime.now() - timedelta(hours=2)
    current_date_time = current_date_time_obj.strftime(format)
    next_date_time = (current_date_time_obj + timedelta(minutes=1)).strftime(format)
    for path in sorted(list(map(str, Path("./binlogs").rglob("*.binlog")))):
        if current_date_time not in path and next_date_time not in path:
            dest_path = os.path.join("staging", os.path.relpath(path, "binlogs"))
            dest_dir = os.path.dirname(dest_path)
            os.makedirs(dest_dir, exist_ok=True)
            os.rename(path, dest_path)
            print(dest_path, dest_dir)
    aws_sync_s3()
    os.system("ls")
    os.system("rm -rf staging")

if __name__ == "__main__":
    AWS_REGION="us-east-1"
    S3_BUCKET="marketdata001-dev"
    main()
