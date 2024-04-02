FROM debian:bullseye-slim

RUN apt -y update
RUN apt -y upgrade
RUN apt -y install prometheus

RUN rm -rf /var/lib/apt/lists/*

RUN mkdir -p /etc/prometheus/
RUN mkdir -p /prometheus

COPY prometheus.yml /etc/prometheus/
COPY alert-rules.yml /etc/prometheus/
COPY entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENTRYPOINT ["/entrypoint.sh"]
