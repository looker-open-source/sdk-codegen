set -e

cd "$(dirname "$0")"
ENV_LIST=./env.list
if [ ! -f $ENV_LIST ]; then
	echo "Please create env.list from env.list.sample"
	exit 1
fi
source $ENV_LIST
pipenv run python create-test-sheet.py "$1"
