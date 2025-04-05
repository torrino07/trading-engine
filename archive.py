import subprocess
import os

os.environ["AWS_DEFAULT_REGION"] = "us-east-1"  

command = [
    "aws",
    "s3",
    "sync",
    "output_parquet",
    "s3://marketdata001-dev/output_parquet/",
    "--exact-timestamps",
]

result = subprocess.run(command, capture_output=True, text=True)

print("Output:", result.stdout)
print("Errors:", result.stderr)
