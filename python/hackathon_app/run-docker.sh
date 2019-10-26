set -e
docker run -d --name hackathon_app_container -p 8080:80 hackathon_app
docker logs -f hackathon_app_container
