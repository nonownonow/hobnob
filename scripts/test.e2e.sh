#!/usr/bin/env bash
# Clean the test index (if it exists)
curl --silent -o /dev/null -X DELETE "$ELASTICSEARCH_HOSTNAME:$ELASTICSEARCH_PORT/$ELASTICSEARCH_INDEX_TEST"
RETRY_INTERVAL=${RETRY_INTERVAL:-2}
if lsof -i:$SERVER_PORT > /dev/null; then
  echo "Anoter process is already listening to port $SERVER_PORT"
  exit 1
fi
if ! launchctl list | grep elasticsearch > /dev/null; then
  echo elasticsearch is not running
  exit 1
#  until curl --silent localhost:9200 -w "" -o /dev/null;do
#    echo elasticsearch is not running yet
#    sleep $RETRY_INTERVAL
#  done
fi
yarn run serve &
until lsof -i:$SERVER_PORT > /dev/null; do
  sleep $RETRY_INTERVAL
done
npx cucumber-js spec/cucumber/features --require-module @babel/register --require spec/cucumber/features/step_definitions
kill -15 0
