set -e
cd frontend
yarn install
yarn build
cd ..
docker build -t hackathon_app .
