#!/bin/sh
set -e

echo "Starting Go API & Backoffice Server on port 8080..."
/usr/local/bin/server_bin &

echo "Starting Nginx HTTP Gateway on port 80..."
nginx -g "daemon off;"
