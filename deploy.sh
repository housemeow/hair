#!/bin/bash

# 載入環境變數
if [ -f .env ]; then
    export $(cat .env | xargs)
else
    echo "Error: .env file not found"
    exit 1
fi

# 檢查必要的環境變數
if [ -z "$FTP_HOST" ] || [ -z "$FTP_USER" ] || [ -z "$FTP_PASS" ]; then
    echo "Error: Missing required environment variables"
    exit 1
fi

# 建構專案
echo "Building project..."
npm run build

# 檢查建構是否成功
if [ $? -ne 0 ]; then
    echo "Error: Build failed"
    exit 1
fi

# 使用 sshpass 和 sftp 上傳檔案
echo "Uploading to SFTP server..."
sshpass -p "$FTP_PASS" sftp -o StrictHostKeyChecking=no "$FTP_USER@$FTP_HOST" << EOF
cd public_html
rm -rf *
put -r dist/*
quit
EOF

# 檢查上傳是否成功
if [ $? -eq 0 ]; then
    echo "Deployment completed successfully!"
else
    echo "Error: Upload failed"
    exit 1
fi
 