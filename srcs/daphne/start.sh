#!/bin/bash


while true; do
    if nc -z -w 2 $POSTGRES_HOST $POSTGRES_PORT; then
        echo "Postgres is up!"
        python manage.py makemigrations >> /dev/null
        python manage.py migrate >> /dev/null
        
        echo "ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS image_link VARCHAR(255);
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS access_token VARCHAR(255);
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS authorization_code VARCHAR(255) UNIQUE;" | psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT >> /dev/null

        break
    else
        echo "Postgres isn't up...waiting..."
        sleep 2
    fi
done

echo "Starting backend!"
python3 manage.py makemigrations >> /dev/null
python3 manage.py migrate >> /dev/null
#daphne -p 8001 myproject.asgi:application
python3 manage.py runserver 0.0.0.0:8000
