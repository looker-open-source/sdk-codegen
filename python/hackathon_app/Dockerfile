FROM tiangolo/uwsgi-nginx-flask:python3.7

RUN pip install pipenv

COPY ./server /app
COPY Pipfile Pipfile.lock /app/

WORKDIR /app

RUN pipenv install --system
