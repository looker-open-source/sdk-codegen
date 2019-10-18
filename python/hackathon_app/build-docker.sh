set -e
cd "$(dirname "$0")"
cd frontend
yarn build
cd ..
docker build -t hackathon_app .
