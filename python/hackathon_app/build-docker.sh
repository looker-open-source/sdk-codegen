set -e
cd frontend
yarn build
cd ..
docker build -t hackathon_app .
