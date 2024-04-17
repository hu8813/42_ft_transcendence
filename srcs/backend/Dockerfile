FROM python:3.12.1-slim-bullseye

RUN apt-get update && apt-get install -y dumb-init openssl

RUN apt-get install -y netcat postgresql-client

WORKDIR /usr/src/app

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

# Generate SSL certificates inside the container
RUN mkdir -p /etc/ssl/certs
RUN openssl req -newkey rsa:4096 -x509 -sha256 -days 365 -nodes \
    -out /etc/ssl/certs/localhost.crt \
    -keyout /etc/ssl/certs/localhost.key \
    -subj "/C=AT/ST=W/L=W/O=42/OU=42/CN=localhost"

# Expose port 443 and copy SSL certificates to desired location
EXPOSE 443

# Install dependencies
RUN pip install --upgrade pip
COPY requirements.txt .
RUN pip install -r requirements.txt

ENTRYPOINT ["dumb-init", "./start.sh"]
