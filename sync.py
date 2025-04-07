from datetime import datetime
from pathlib import Path
import os

def aws_sync_s3(directory):
    response = os.system(f"aws s3 sync {directory} s3://{S3_PATH} --exact-timestamps --region {AWS_REGION}")
    print("Sync successful" if response == 0 else "Sync failed")

def filter_files(directory):
    biggest_hour, lowest_biggest_minute = -1, -1
    
    for root, _, _ in os.walk(directory):
        parts = root.split("/")
        if len(parts) >= 9:
            try:
                hour, minute = int(parts[-2]), int(parts[-1])
                if hour > biggest_hour or (hour == biggest_hour and minute > lowest_biggest_minute):
                    biggest_hour, lowest_biggest_minute = hour, minute
            except ValueError:
                continue
    if lowest_biggest_minute > 2:
        date = datetime.now().strftime("%Y-%m-%d")
        files = sorted(list(map(str, Path(directory).rglob("*.binlog"))))
        return [f for f in files if f"/{date}/{biggest_hour}/{lowest_biggest_minute}/" not in f]
    else:
        return None

def main():
    filtered_files = filter_files("./binlogs")
    
    if filtered_files != None:
        for file in filtered_files:
            dest_path = os.path.join("staging", os.path.relpath(file, "binlogs"))
            dest_dir = os.path.dirname(dest_path)
            os.makedirs(dest_dir, exist_ok=True)
            try:
                os.rename(file, dest_path)
                print(f"Moved {file} to {dest_path}")
            except OSError as e:
                print(f"Failed to move {file} to {dest_path}: {e}")

        aws_sync_s3("./staging")

if __name__ == "__main__":
    AWS_REGION="us-east-1"
    S3_PATH="marketdata001-dev/binlogs"
    main()
