set -e

cd "$(dirname "$0")"
ENV_LIST=./env.list
if [ ! -f $ENV_LIST ]; then
	echo "Please create env.list from env.list.sample"
	exit 1
fi

if [ $# -eq 0 ]; then
	ARGS=tests/

# if any arguments are passed, they need to include the path to tests/
else
	ARGS="$@"
	shift
fi

source $ENV_LIST
pipenv run py.test $ARGS
