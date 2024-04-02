FROM python:3.12.1-slim-bullseye

RUN apt-get update && apt-get install -y dumb-init

RUN apt-get install -y netcat postgresql-client

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1

ENV PYTHONUNBUFFERED 1

RUN pip install --upgrade pip

COPY requirements.txt .


RUN pip install -r requirements.txt

ENTRYPOINT ["dumb-init", "./start.sh"]