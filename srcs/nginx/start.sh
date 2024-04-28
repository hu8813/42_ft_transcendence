#!/bin/bash


while true; do
    if nc -z -w 2 backend 8000; then
        echo -e "${Green}Backend is up!"
        sleep 1
        break
    else
        echo -e "${Red}Backend isn't up...waiting..."
        sleep 4
    fi
done

echo -e "Ready! Open: https://localhost:8443/"

nginx -g "daemon off;"
#nginx