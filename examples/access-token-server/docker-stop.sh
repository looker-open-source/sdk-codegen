set -e
cd "$(dirname "$0")"
docker stop access-token-server && docker rm access-token-server
