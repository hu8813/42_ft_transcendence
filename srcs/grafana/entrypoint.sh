#!/bin/sh

exec grafana-server --config=/usr/share/grafana/conf/defaults.ini --homepath /usr/share/grafana
