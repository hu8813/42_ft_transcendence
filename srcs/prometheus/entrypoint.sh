#!/bin/sh

export GF_IP="${GF_IP:-localhost}"
sed -i "s/\${GF_IP:localhost}/$GF_IP/g" /etc/prometheus/prometheus.yml

sleep 5

exec prometheus --config.file=/etc/prometheus/prometheus.yml --storage.tsdb.path=/prometheus
