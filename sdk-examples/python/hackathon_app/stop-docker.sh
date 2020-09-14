set -e
cd "$(dirname "$0")"
docker stop hackathon_app_container && docker rm hackathon_app_container
