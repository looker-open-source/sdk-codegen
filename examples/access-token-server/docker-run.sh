set -e
docker run -d --name access-token-server -p 8081:8081 access-token-server
docker logs -f access-token-server
