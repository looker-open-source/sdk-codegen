#!/bin/sh

check_looker() {
  status=$(curl --silent --insecure --write "%{http_code}" \
    --data "client_id=$LOOKERSDK_CLIENT_ID&client_secret=$LOOKERSDK_CLIENT_SECRET"\
    $LOOKERSDK_BASE_URL/api/$LOOKERSDK_API_VERSION/login\
    -o /dev/null)
}

MAX_RETRIES=160
ATTEMPTS=1
status=0
check_looker
while [ $status -ne 200 ];
do
  RETRY_MSG="after $ATTEMPTS attempts: $MAX_RETRIES retries remaining."
  if [ $ATTEMPTS -ge $MAX_RETRIES ];
  then
    echo 'Looker took too long to start'
    exit 1
  else
    if [ $status -ne 0 ];
    then
      echo "Received status($status) from Looker $RETRY_MSG"
    else
      echo "Looker server connection rejected $RETRY_MSG"
    fi
  fi

  sleep 2
  ATTEMPTS=$(( $ATTEMPTS + 1 ))
  check_looker
done
echo "Looker ready after $ATTEMPTS attempts"
exit 0
