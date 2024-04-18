#!/bin/bash

#: "${WEBSOCKET_PORT:=8001}

# Wait for Postgres to be ready
while true; do
    if nc -z -w 2 $POSTGRES_HOST $POSTGRES_PORT; then
        echo "Postgres is up!"
        python manage.py makemigrations >> /dev/null
        python manage.py migrate >> /dev/null
        
        echo "ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS image_link VARCHAR(255);
ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS access_token VARCHAR(255);

ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS authorization_code VARCHAR(255) UNIQUE;
INSERT INTO auth_user (username, email, password, first_name, last_name, is_superuser, is_staff, is_active, date_joined, score, nickname, image_link)
VALUES
    ('user1', 'user1@example.com', 'password1', 'John', 'Doe', FALSE, FALSE, TRUE, NOW(), 0, 'Johny', 'https://pong42.vercel.app/src/logo.png'),
    ('user2', 'user2@example.com', 'password2', 'Jane', 'Smith', FALSE, FALSE, TRUE, NOW(), 0, 'Janey', 'https://pong42.vercel.app/src/logo.png'),
    ('user3', 'user3@example.com', 'password3', 'Bob', 'Johnson', FALSE, FALSE, TRUE, NOW(), 0, 'Bobby', 'https://pong42.vercel.app/src/logo.png'),
    ('user4', 'user4@example.com', 'password4', 'Alice', 'Johnson', FALSE, FALSE, TRUE, NOW(), 0, 'Alicia', 'https://pong42.vercel.app/src/logo.png'),
    ('user5', 'user5@example.com', 'password5', 'Eva', 'Brown', FALSE, FALSE, TRUE, NOW(), 0, 'Evie', 'https://pong42.vercel.app/src/logo.png'),
    ('user6', 'user6@example.com', 'password6', 'Michael', 'Lee', FALSE, FALSE, TRUE, NOW(), 0, 'Mike', 'https://pong42.vercel.app/src/logo.png'),
    ('user7', 'user7@example.com', 'password7', 'Emily', 'Garcia', FALSE, FALSE, TRUE, NOW(), 0, 'Emi', 'https://pong42.vercel.app/src/logo.png'),
    ('user8', 'user8@example.com', 'password8', 'Daniel', 'Martinez', FALSE, FALSE, TRUE, NOW(), 0, 'Danny', 'https://pong42.vercel.app/src/logo.png'),
    ('user9', 'user9@example.com', 'password9', 'Sophia', 'Hernandez', FALSE, FALSE, TRUE, NOW(), 0, 'Sophie', 'https://pong42.vercel.app/src/logo.png'),
    ('user10', 'user10@example.com', 'password10', 'Alexander', 'Lopez', FALSE, FALSE, TRUE, NOW(), 0, 'Alex', 'https://pong42.vercel.app/src/logo.png'),
    ('user11', 'user11@example.com', 'password11', 'Emma', 'Adams', FALSE, FALSE, TRUE, NOW(), 0, 'Emmie', 'https://pong42.vercel.app/src/logo.png'),
    ('user12', 'user12@example.com', 'password12', 'Oliver', 'Wright', FALSE, FALSE, TRUE, NOW(), 0, 'Ollie', 'https://pong42.vercel.app/src/logo.png'),
    ('user15', 'user15@example.com', 'password15', 'Ava', 'Young', FALSE, FALSE, TRUE, NOW(), 0, 'Avie', 'https://pong42.vercel.app/src/logo.png');

" | psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT >> /dev/null

        break
    else
        echo "Postgres isn't up...waiting..."
        sleep 2
    fi
done

# Start Gunicorn with SSL certificate and key
echo "Starting backend with Gunicorn!"
python3 manage.py makemigrations >> /dev/null
python3 manage.py migrate >> /dev/null
#daphne -b 0.0.0.0 -p 8001 myproject.asgi:application &
#gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --certfile "/etc/ssl/certs/localhost.crt" --keyfile "/etc/ssl/certs/localhost.key" --workers 4 --timeout 300 
#-e ssl:443:privateKey=/etc/ssl/certs/localhost.crt:certKey=/etc/ssl/certs/localhost.key
daphne -e ssl:443:privateKey=/etc/ssl/certs/localhost.crt:certKey=/etc/ssl/certs/localhost.key -b 0.0.0.0 -p 8001 myproject.asgi:application & gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --certfile "/etc/ssl/certs/localhost.crt" --keyfile "/etc/ssl/certs/localhost.key" --workers 4 --timeout 300
