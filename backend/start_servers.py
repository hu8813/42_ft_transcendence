#!/bin/bash
python3 manage.py runserver 0.0.0.0:8000 &
python3 myproject/socketio_server.py &
wait
