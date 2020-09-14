FROM tiangolo/uwsgi-nginx-flask:python3.7

RUN pip install pipenv

COPY ./server /app
COPY Pipfile Pipfile.lock looker.py sheets.py config.py logging.conf authentication.py /app/
COPY env.list /app/prestart.sh

WORKDIR /app

RUN pipenv install --system

ENV STATIC_INDEX 1

COPY ./frontend/build /app/static
