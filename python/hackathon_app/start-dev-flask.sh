set -e
cd "$(dirname "$0")"
ENV_LIST=./env.list
if [ ! -f $ENV_LIST ]; then
	echo "Please create env.list from env.list.sample"
	exit 1
fi
source $ENV_LIST
export FLASK_APP="server.main"
export FLASK_ENV="development"
pipenv run flask run
