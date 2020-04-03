#!/bin/bash



for ARGUMENT in "$@"
do

    KEY=$(echo $ARGUMENT | cut -f1 -d=)
    VALUE=$(echo $ARGUMENT | cut -f2 -d=)   

    case "$KEY" in
            MONGO_USER)              MONGO_USER=${VALUE} ;;
            MONGO_PASS)    MONGO_PASS=${VALUE} ;;    
            MONGO_DB)    MONGO_DB=${VALUE} ;;   
            *)   
    esac    


done

ENV_FILE=.env

if [ -f "$ENV_FILE" ]; then
    echo "$ENV_FILE exist"
    cp $ENV_FILE ./app
else 
    echo "$ENV_FILE does not exist"
    exit 1
fi

if [ -z "$MONGO_USER" ] || [ -z "$MONGO_PASS" ] || [ -z "$MONGO_DB" ]; then
  echo 'Please define the variables'
  exit 1
fi


parent_path=$( cd "$(dirname "${BASH_SOURCE[0]}")" ; pwd -P )
cd "$parent_path"

sed -e "s/MONGO_USER/$MONGO_USER/g; s/MONGO_PASS/$MONGO_PASS/g; s/MONGO_DB/$MONGO_DB/g; " ../init/init_mongo.tmpl > ../init/init_mongo.js
cat ../init/init_mongo.js
echo "init/init_mongo.js"

cd ..

echo "Within directory:"
pwd

sed -i -e "s/%%BUILD_NUMBER%%/$BUILD_NUMBER/g" ./app/frontend/src/environment.prod.ts

ls init