#!/usr/bin/env bash
# make all matches case-insensitive
shopt -s nocasematch

# Looker API generation script originally based on https://discourse.looker.com/t/generating-client-sdks-for-the-looker-api/3185
# OpenAPI codegen project is at https://github.com/OpenAPITools/openapi-generator
# Getting started with the API: https://docs.looker.com/reference/api-and-integration/api-getting-started

GEN_PATH="./openapi-generator"
KIT="./oas-kit"
KITVER="v3.0.0"
API_SPEC="lookerapi.json"
V3="lookerapi.v3.json"
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
    if [ ! -f "$CONFIG_FILE" ]; then
        echo "Please create '$CONFIG_FILE' with your API configuration values similar to '$SAMPLE_FILE':"
        cat "$SAMPLE_FILE"
        exit 1
    fi

    echo "Getting configuration values from '$CONFIG_FILE' ..."
    while IFS='= ' read var val
    do
        if [[ ${var} == \[*] ]]; then
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
    V3="lookerapi.$API_VERSION.v3.json"
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

function upgradeSpec()
{
    S2=${KIT}/packages/swagger2openapi/
    echo "Upgrading to OAS 3.x ..."
    echo "node ${S2}swagger2openapi.js -o ${V3} ${API_SPEC}"
    node ${S2}swagger2openapi.js -o ${V3} ${API_SPEC}
    if [ ! -f "$V3" ]; then
        echo "Could not upgrade ${API_SPEC} to OAS 3.x"
        exit 2
    fi
    echo "Validating upgrade ..."
    echo "node ${S2}oas-validate.js --validateSchema --lint ${V3}"
    node ${S2}oas-validate.js --validateSchema --lint ${V3}
    if [ $? -gt 0 ]; then
        echo "Upgrade spec lint errors!"
        exit $?
    fi
    API_SPEC="${V3}"
}

echo "Looker API preparation syntax: prepare [clean|wipe|file]"
echo "  clean: remove generated 'api/*' folders"
echo "  wipe: 'clean', and also remove the '${GEN_PATH}' folder"
echo "  file: configuration file name to use instead of '$CONFIG_FILE'"

if [[ "$OPTION" =~ ^(clean|Clean|CLEAN)$ ]]; then
    OPTION="CLEAN"
elif [[ "$OPTION" =~ ^(wipe|Wipe|WIPE)$ ]]; then
    OPTION="WIPE"
elif [ "$OPTION" != "" ]; then
    # not recognized option .. possibly config file?
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

# ensure code generator is available
if [ -d "$GEN_PATH" ]; then
    if [ "${OPTION}" == "WIPE" ]; then
        echo "Cleaning ${GEN_PATH} ..."
        rm -rf ${GEN_PATH}
    else
        echo "'${GEN_PATH}' already exists. Use '${GEN_PATH}/mvn clean package' or '${GEN_PATH}/mvnw clean package' to rebuild if necessary."
    fi
elif [ ! "${OPTION}" == "WIPE" ]; then
    echo "'${GEN_PATH}' does not exist. Gitting and building ..."
    git clone https://github.com/OpenAPITools/openapi-generator ${GEN_PATH}
    cd ${GEN_PATH}
    # git checkout tags/v${SWAGGER_VERSION}
    ./mvnw clean package
    cd ..
fi

# comment out until spec upgrade works again
# ensure Spec upgrader is available
# if [ -d "$KIT" ]; then
#     if [ "${OPTION}" == "WIPE" ]; then
#         echo "Cleaning ${KIT} ..."
#         rm -rf ${KIT}
#     else
#         echo "'${KIT}' already exists. Run 'npm i' in ${KIT} and ${KIT}/packages/swagger2openapi/ to rebuild if necessary."
#     fi
# elif [ ! "${OPTION}" == "WIPE" ]; then
#     echo "'${KIT}' does not exist. Gitting and installing ..."
#     git clone https://github.com/mermade/oas-kit ${KIT}
#     git checkout tags/{$KITVER}
#     cd ${KIT}
#     npm i
#     cd packages/swagger2openapi/
#     npm i
#     cd ../../..
# fi

if [ "${OPTION}" == "WIPE" ]; then
    OPTION="CLEAN"
fi

# comment out until spec upgrade works again
# if [ "${OPTION}" != "CLEAN" ]; then
#     upgradeSpec
# else
#     if [ -f "$V3" ]; then
#         rm ${V3}
#     fi
# fi

if [ ! -f "$TARGET_FILE" ]; then
    echo "'$TARGET_FILE' is missing."
    echo "Create a file named '${TARGET_FILE}' with one line per language definition with a structure like:"
    echo "Client-language:sdk_folder_name:optional generation arguments"
    echo "For example:"
    echo "  kotlin:kotlin_sdk:-DapiPackage=Looker"
    echo "  python:python_sdk:-DapiPackage=looker"
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
            java -jar ${GEN_PATH}/modules/openapi-generator-cli/target/openapi-generator-cli.jar generate -i ${API_SPEC} -g $LANGUAGE -o api/$API --enable-post-process-file $OPT
        fi
    fi
done < "$TARGET_FILE"
