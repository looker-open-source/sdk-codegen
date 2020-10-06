# Hackathon App

Welcome to the hackathon app: a web app using a React frontend and a python flask backend

## Getting setup for local development

### Frontend

Node 12 is required for the frontend. You can use [nvm](https://github.com/creationix/nvm#installation) and [avn](https://github.com/wbyoung/avn#install) to easily switch Node versions between different projects.

From `sdk-examples/python/hackathon_app/` directory:
```sh
cd frontend/
yarn install
yarn start
```

You can work on the frontend React app without running the python server or having any backend google sheets or looker instance dependencies. Simply skip the remaining setup.

### Backend

hackathon_app requires python 3.7+ The easiest way to get this installed on a mac is to install [pyenv](https://github.com/pyenv/pyenv#installation) via [homebrew](https://brew.sh/). If you already have pyenv and pipenv installed then skip to the "Install all dependencies" step

(note, if you were in the `frontend/` directory above then `cd ..` back to `sdk-examples/python/hackathon_app/`)

```sh
brew install pyenv
```

**Important** [Follow these remaining steps (only 3 - 5)](https://github.com/pyenv/pyenv#basic-github-checkout) to complete the pyenv installation

Now you’re ready to install python 3.7 and set it as your global python version for the following steps

```sh
pyenv install 3.7.4
pyenv global 3.7.4
```

hackathon_app uses [pipenv](https://docs.pipenv.org/en/latest/#install-pipenv-today) to manage project dependencies

```sh
brew install pipenv
```

Install all dependencies.

```sh
pipenv install --dev
```

#### Create sheets api creds

Create a GCP project in your personal google console account:

- enable Sheets api
- enable Drive api
- create a service account
- download the .json creds file
- copy the email address for the next step

#### Setup `env.list`

- Copy `env.list.sample` to `env.list` and modify accordingly (see instructions for base64 encoding your gcp .json credentials in the code comment for `GOOGLE_APPLICATION_CREDENTIAL_ENCODED`)
- Leave `GOOGLE_SHEET_ID` alone for now, you'll add it after the next step

#### Create a google spreadsheet

```sh
./create-test-sheet.sh <email-to-own-sheet@same-gmail-domain-as-gcp-project.com>
```

- go back to your spreadsheet and "share" it with the email address of the service account
- Note the sheet ID (from the output) to use in the `env.list` file below.

#### Run local dev servers

```sh
./start-dev-flask.sh
```

- this launches the backend server available at http://127.0.0.1:5000

```sh
cd frontend/
yarn start
```

- this launches the frontend static server at http://127.0.0.1:3000 which proxies fetch requests to the backend server

## Bulk import script

The `bulk_import.py` script reads a CSV file that has "first_name", "last_name", and "email" column headers and adds users to the hack instance.
It can be re-run safely w/out duplicating users (primary key is "email"). It will send newly registered users an account setup email.

```
❯ pipenv run python bulk_import.py --help
Usage: bulk_import.py [OPTIONS] FILENAME HACKATHON LIMIT

Options:
  --help  Show this message and exit.


❯ pipenv run python bulk_import.py names.csv hack_at_home 5
Registering beans@baked.com
Registering spam@lovely.com
Registering spam@wonderful.com
Registering joeldodge+hackuser@google.com
Registered 4 users
```

## Production deployment

Deployment is partially automated. devops has an ansible runbook that they execute manually when we want a new version deployed.
It currently looks something like this (I don't have access to the repo where it lives so this is probably stale but you'll get the idea)
```
- name: Docker image and push
  hosts: localhost
  connection: local
  gather_facts: false
  # currently we have these secrets/vars stored:
  #   export LOOKERSDK_CLIENT_ID={{ lookersdk_client_id }}
  #   export LOOKERSDK_CLIENT_SECRET={{ lookeradk_client_secret }}
  #   export GOOGLE_SHEET_ID={{ google_sheet_id }}
  #   export GOOGLE_APPLICATION_CREDENTIAL_ENCODED={{ google_application_credential_encoded }}  # currently using credentials from a service account in the looker-se GCP project: https://console.cloud.google.com/home/dashboard?project=looker-se
  #   export FLASK_WTF_CSRF_SECRET_KEY={{ flask_wtf_csrf_secret_key }}
  #   export FLASK_SECRET_KEY={{ flask_secret_key }}
  #   export LOOKERSDK_API_VERSION='3.1'
  #   export LOOKERSDK_BASE_URL='https://hack.looker.com:19999'
  #   export GOOGLE_APPLICATION_CREDENTIALS='./google-creds.json'
  vars_files:
    - roles/dockerapps/vars/hackathonapp_vault.yml
    - roles/dockerapps/vars/hackathonapp_vars.yml

  tasks:

      # checkout hackathonapp repo
      - git:
          repo: git@github.com:looker-open-source/sdk-examples.git
          dest: "{{hackathonapp_checkout_location}}"
          version: "{{hackathonapp_app_version}}"
        register: git_info

      # write .env with info
      - template: src=roles/dockerapps/templates/hackathonapp_.env.j2 dest="{{ hackathonapp_app_location }}/env.list"

      # write status.json with info
      - template: src=roles/dockerapps/templates/hackathonapp_status.json.j2 dest="{{ hackathonapp_checkout_location }}/status.json"

      # build using shell scripts
      - name: Build docker image using shell scripts
        shell: cd frontend && yarn install && cd {{ hackathonapp_app_location }} && ./build-docker.sh
        args:
            chdir: "{{ hackathonapp_app_location }}"
        sudo: no
        register: out
      - debug:
          msg: "{{out.stdout}}"

      # get docker login to ECR
      - name: Get ECR login through AWS CLI
        shell: aws ecr get-login --region us-east-1 --no-include-email --registry-ids {{ image_repo_account_id[img_environment] }}
        sudo: no
        register: ecrlogin

      # Actually log in to ECR
      - name: Run docker login from ECR login
        shell: "{{ ecrlogin.stdout }}"
        sudo: no
        register: out
      - debug:
          msg: "{{out.stdout}}"

      # docker tag IMAGE:TAG REPO_URI:TAG
      - name: Docker tag the new image to prepare for push to the ECR repo
        shell: docker tag {{image_name}}:{{image_built_on}}{{git_info.after}} {{image_repo[img_environment]}}:{{image_built_on}}{{git_info.after}}
        sudo: no
        register: out
      - debug:
          msg: "{{out.stdout}}"

      # docker push REPO_URI:TAG
      - name: Push Docker tag to ECR repo
        shell: docker push {{image_repo[img_environment]}}:{{image_built_on}}{{git_info.after}}
        sudo: no
        register: out
      - debug:
          msg: "{{out.stdout}}"

      # teardown git repo
      - name: Teardown git repo
        local_action: shell rm -rf {{ hackathonapp_checkout_location }}
```

### Build docker image

Make sure to [install docker](https://download.docker.com/mac/stable/Docker.dmg)

```sh
./build-docker.sh
```

you can run the docker container locally with

```sh
./run-docker.sh
```

which exposes the whole app (both frontend and backend) on http://127.0.0.1:8080

to stop:

```sh
sh stop-docker.sh
```

# Hackathon email authentication

Email authentication for the Hackathon app is supported via an email link with an auth code, and Google login.
![Hackitecture](hackitecture.jpg)
