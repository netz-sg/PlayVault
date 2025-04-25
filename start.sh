#!/bin/bash

set -e

echo "Waiting for database to be ready..."
# Wait for DB to be ready
MAX_RETRIES=30
count=0
until mysql -h db -u user -ppassword -D game_library -e "SELECT 1" &> /dev/null
do
  echo "Waiting for database connection..."
  sleep 5
  count=$((count+1))
  if [ $count -gt $MAX_RETRIES ]; then
    echo "Error: Couldn't connect to database after $MAX_RETRIES attempts!"
    exit 1
  fi
done

echo "Database connection established"

# Check for tables
TABLE_COUNT=$(mysql -h db -u user -ppassword -D game_library -e "SELECT COUNT(table_name) FROM information_schema.tables WHERE table_schema = 'game_library'" -s)
if [ "$TABLE_COUNT" -eq 0 ]; then
  echo "No tables found. Tables should be created by db-init service."
  echo "Waiting for tables to be created..."
  
  # Wait for the Game table to exist
  MAX_RETRIES=30
  count=0
  until mysql -h db -u user -ppassword -D game_library -e "SELECT 1 FROM Game LIMIT 1" &> /dev/null
  do
    echo "Waiting for tables to be created..."
    sleep 5
    count=$((count+1))
    if [ $count -gt $MAX_RETRIES ]; then
      echo "Error: Tables weren't created after $MAX_RETRIES attempts!"
      exit 1
    fi
  done
  
  echo "Tables found successfully!"
fi

echo "Starting application..."
node server.js 