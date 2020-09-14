set -e
cd frontend
yarn install
yarn build
cd ..
if [ -f status.json ]; then
	mv status.json frontend/build/
fi
docker build -t hackathon_app .
