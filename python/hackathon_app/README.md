# Hackathon App

Welcome to the hackathon app: a web app using a React frontend and a python flask backend

### Getting setup for local development


#### Frontend

Node 10 is required for the frontend. You can use [nvm](https://github.com/creationix/nvm#installation) and [avn](https://github.com/wbyoung/avn#install) to easily switch Node versions between different projects.

```sh
cd frontend/
yarn install
yarn start
```
You can work on the frontend React app without running the python server or having any backend google sheets or looker instance dependencies. Simply skip the remaining setup.

#### Backend

hackathon_app requires python 3.7+ The easiest way to get this installed on a mac is to install [pyenv](https://github.com/pyenv/pyenv#installation) via [homebrew](https://brew.sh/)


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

### Create a google spreadsheet

```sh
./create-test-sheet.sh <email-to-own-sheet@some-gmail-domain.com>
```

Note the sheet ID (from the output) to use in the `env.list` file below.

### sheets api creds
Create a GCP project:
- enable Sheets api
- enable Drive api
- create a service account
- go back to your spreadsheet and "share" it with the email address of the service account

### Run local dev servers

Copy `env.list.sample` to `env.list` and modify accordingly

```sh
./start-dev-flask.sh
```

- this launches the backend server available at http://127.0.0.1:5000

```sh
cd frontend/
yarn start
```

- this launches the frontend static server at http://127.0.0.1:3000 which proxies fetch requests to the backend server


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
