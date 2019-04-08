#!/usr/bin/env bash
# make all matches case-insensitive
shopt -s nocasematch

# Looker API generation script based on https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185
# Swagger codegen building notes at https://github.com/swagger-api/swagger-codegen#building
# Getting started with the API: https://docs.looker.com/reference/api-and-integration/api-getting-started

SWAGGER_PATH="swagger-codegen"
SWAGGER_VERSION="2.3.1"
API_SPEC="lookerapi.json"
TARGET_FILE="target_languages.txt"
CONFIG_FILE="looker.ini"
SAMPLE_FILE="looker-sample.ini"
API_NAME="LookerAPI"
OPTION="$1"
BASE_URL=""
CLIENT_ID=""
CLIENT_SECRET=""

# Read the API configuration values from the config file
function readConfigFile()
{
    if [ ! -f "$CONFIG_FILE" ] ; then
        echo "Please create '$CONFIG_FILE' with your API configuration values, like the following from '$SAMPLE_FILE':"
        cat "$SAMPLE_FILE"
        exit 1
    fi

    echo "Getting configuration values from '$CONFIG_FILE' ..."
    while IFS='= ' read var val
    do
        if [[ ${var} == \[*] ]] ; then
            # Reading the section of the ini
            section=${var}
        elif [[ ${var} =~ ^(api_version)$ ]]; then
            API_VERSION=${val}
        elif [[ ${var} =~ ^(base_url)$ ]]; then
            BASE_URL=${val}
        elif [[ ${var} =~ ^(client_id)$ ]]; then
            CLIENT_ID=${val}
        elif [[ ${var} =~ ^(client_secret)$ ]]; then
            CLIENT_SECRET=${val}
        fi
    done < "$CONFIG_FILE"
    API_SPEC="lookerapi.$API_VERSION.json"
    echo "api version:$API_VERSION url:$BASE_URL"
}

# Retrieve the API Spec from the running server instances
function fetchApiSpec()
{
    # -k tells curl to ignore self-signed certificate issues
    CURL="curl -k"

    # Get an access token using the supplied client id and secret
    auth_token_json=$(${CURL} -d "client_id=$CLIENT_ID&client_secret=$CLIENT_SECRET" ${BASE_URL}/login)
    regex=".*\"access_token\":\"([A-Za-z0-9]*)\".*"
    if [[ $auth_token_json =~ $regex ]]; then
        access_token="${BASH_REMATCH[1]}"
        echo "Token:$access_token"
    else
        echo "Access token creation failed. Exiting..."
        exit 1
    fi

    # Get a version of swagger.json from the looker instance provided, using the auth token created
    ${CURL} -o ${API_SPEC} -H "Authorization: token ${access_token}" ${BASE_URL}/api/${API_VERSION}/swagger.json

    # Delete the auth token
    ${CURL} -X DELETE -H "Authorization: token $access_token" ${BASE_URL}/logout

    echo "Saved ${BASE_URL}/api/${API_VERSION}/swagger.json as '$API_SPEC'"
}

echo "Looker API preparation syntax: prepare [clean|wipe|file]"
echo "  clean: remove generated 'api/*' folders"
echo "  wipe: remove 'swagger-codegen' folder in addition to 'clean'"
echo "  file: configuration file name to use instead of '$CONFIG_FILE'"

if [[ "$OPTION" =~ ^(clean|Clean|CLEAN)$ ]]; then
    OPTION="CLEAN"
elif [[ "$OPTION" =~ ^(wipe|Wipe|WIPE)$ ]]; then
    OPTION="WIPE"
elif [ "$OPTION" != "" ]; then
    CONFIG_FILE="$OPTION"
    OPTION=""
fi

readConfigFile

if [ -f "$API_SPEC" ]; then
    echo "'$API_SPEC' is present."
else

    fetchApiSpec

    if [ ! -f "$API_SPEC" ]; then
        echo "'$API_SPEC' is missing. Please follow the instructions at https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185"
        exit 1
    fi
fi

if [ -d "$SWAGGER_PATH" ]; then
    if [ "${OPTION}" == "WIPE" ]; then
        echo "Cleaning ${SWAGGER_PATH} ..."
        rm -rf ${SWAGGER_PATH}
        OPTION="CLEAN"
    else
        echo "'$SWAGGER_PATH' already exists. Use '$SWAGGER_PATH\mvn clean package' to rebuild if necessary."
    fi
elif [ ! "${OPTION}" == "WIPE" ]; then
    echo "'$SWAGGER_PATH' does not exist. Gitting and building ..."
    git clone https://github.com/swagger-api/swagger-codegen.git ./swagger-codegen
    cd swagger-codegen
    git checkout tags/v${SWAGGER_VERSION}
    mvn clean package
    cd ..
fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "'$TARGET_FILE' is missing."
    echo "Create a file named '${TARGET_FILE}' with one line per language definition with a structure like:"
    echo "Client-language:sdk_folder_name:optional generation arguments"
    echo "For example:"
    echo "  kotlin:kotlin_sdk:-DpackageName=Looker"
    echo "  python:python_sdk:-DpackageName=looker"
    echo "  typescript-node:typescript_node_sdk"
    exit
fi

while IFS=':' read -ra line || [[ -n "$line" ]]; do
    count=${#line[@]}
    LANGUAGE=${line[0]}
    [[ ${LANGUAGE:0:1} == ";" ]] && continue # skip if the line is a comment
    if [ $count -lt 2 ] || [ $count -gt 3 ] ; then
        echo "Invalid input: ${line[@]}"
    else
        API=${line[1]}
        if [ $count -eq 3 ] ; then
            OPT=${line[2]}
        fi
        if [ "${OPTION}" == "CLEAN" ]; then
            echo "Cleaning API folder api/$API ..."
            rm -rf api/${API}
        else
            echo "generating '$LANGUAGE' to 'api/$API' $OPT ..."
            java -jar ./swagger-codegen/modules/swagger-codegen-cli/target/swagger-codegen-cli.jar generate -i ${API_SPEC} -l $LANGUAGE -o api/$API $OPT
        fi
    fi
done < "$TARGET_FILE"
