#!/bin/bash

#: "${WEBSOCKET_PORT:=8001}

# Wait for Postgres to be ready
while true; do
    if nc -z -w 2 $POSTGRES_HOST $POSTGRES_PORT; then
        echo "Postgres is up!"
        # python manage.py makemigrations admin
        # python manage.py makemigrations auth
        # python manage.py makemigrations myapp
        # python manage.py migrate admin
        # python manage.py migrate auth
        # python manage.py migrate myapp
        # python manage.py migrate
        python manage.py makemigrations admin auth myapp
        python manage.py migrate

        
#         echo "

# -- Create tables
# CREATE TABLE IF NOT EXISTS auth_user_friends (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id),
#     friend_id INTEGER REFERENCES auth_user(id),
#     from_user_id INTEGER REFERENCES auth_user(id),
#     CONSTRAINT unique_user_friend UNIQUE (user_id, friend_id)
# );

# CREATE TABLE IF NOT EXISTS myapp_feedback (
#     id SERIAL PRIMARY KEY,
#     feedback_text TEXT,
#     created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
# );

# CREATE TABLE IF NOT EXISTS myapp_userprofile (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER UNIQUE REFERENCES auth_user(id),
#     score INTEGER DEFAULT 0,
#     nickname VARCHAR(100)
# );

# CREATE TABLE IF NOT EXISTS myapp_user_permissions (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id),
#     permission_id INTEGER REFERENCES auth_permission(id)
# );

# CREATE TABLE IF NOT EXISTS myapp_user_groups (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id),
#     group_id INTEGER REFERENCES auth_group(id)
# );

# CREATE TABLE IF NOT EXISTS myapp_achievement (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id),
#     games_played INTEGER DEFAULT 0,
#     games_won INTEGER DEFAULT 0,
#     games_lost INTEGER DEFAULT 0,
#     tournaments_won INTEGER DEFAULT 0,
#     favorite_game VARCHAR(100)
# );

# CREATE TABLE IF NOT EXISTS auth_user_blocked_users (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id),
#     blocked_user_id INTEGER REFERENCES auth_user(id)
# );

# CREATE TABLE IF NOT EXISTS myapp_waitingplayer (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER UNIQUE REFERENCES auth_user(id)
# );

# CREATE TABLE IF NOT EXISTS GameStats (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
#     opponent VARCHAR(100) NOT NULL,
#     win BOOLEAN NOT NULL,
#     date_time_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
# );

# CREATE TABLE IF NOT EXISTS myapp_channel (
#     id SERIAL PRIMARY KEY,
#     name VARCHAR(100),
#     owner_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
#     moderator_id INTEGER REFERENCES auth_user(id) ON DELETE SET NULL,
#     password VARCHAR(100)
# );


# CREATE TABLE IF NOT EXISTS myapp_gamestats (
#     id SERIAL PRIMARY KEY,
#     user_id INTEGER REFERENCES auth_user(id) ON DELETE CASCADE,
#     opponent VARCHAR(100),
#     win BOOLEAN,
#     date_time_played TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
# );

# -- Alter tables
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS two_factor_enabled BOOLEAN DEFAULT FALSE;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS score INTEGER DEFAULT 0;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS image_link VARCHAR(255);
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS access_token VARCHAR(255);
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS authorization_code VARCHAR(255) UNIQUE;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS activation_code VARCHAR(255);
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS is_oauth_user BOOLEAN DEFAULT TRUE;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS games_won INTEGER DEFAULT 0;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS games_played INTEGER DEFAULT 0;
# ALTER TABLE auth_user ADD COLUMN IF NOT EXISTS games_lost INTEGER DEFAULT 0;

# ALTER TABLE auth_user_friends ADD COLUMN IF NOT EXISTS from_user_id INTEGER REFERENCES auth_user(id);
# ALTER TABLE auth_user_friends ADD COLUMN IF NOT EXISTS to_user_id INTEGER REFERENCES auth_user(id);
# ALTER TABLE myapp_achievement ADD COLUMN IF NOT EXISTS date_time_played TIMESTAMP DEFAULT CURRENT_TIMESTAMP, ADD COLUMN IF NOT EXISTS opponent VARCHAR(100), ADD COLUMN IF NOT EXISTS game_type VARCHAR(100);
# ALTER TABLE auth_user_blocked_users ADD COLUMN IF NOT EXISTS from_user_id INTEGER REFERENCES auth_user(id);
# ALTER TABLE auth_user_blocked_users ADD COLUMN IF NOT EXISTS to_user_id INTEGER REFERENCES auth_user(id);


# " | psql -h $POSTGRES_HOST -U $POSTGRES_USER -d $POSTGRES_DB -p $POSTGRES_PORT > /dev/null 2>&1

        break
    else
        echo "Postgres isn't up...waiting..."
        sleep 2
    fi
done

# python manage.py makemigrations admin >/dev/null 2>&1
# python manage.py makemigrations auth >/dev/null 2>&1
# python manage.py makemigrations myapp >/dev/null 2>&1
# python manage.py migrate admin >/dev/null 2>&1
# python manage.py migrate auth >/dev/null 2>&1
# python manage.py migrate myapp >/dev/null 2>&1
# python manage.py migrate >/dev/null 2>&1
# python manage.py collectstatic > /dev/null 2>&1
echo "Starting backend"

#daphne -b 0.0.0.0 -p 8001 myproject.asgi:application &
#gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --certfile "/etc/ssl/certs/localhost.crt" --keyfile "/etc/ssl/certs/localhost.key" --workers 4 --timeout 300 
#-e ssl:443:privateKey=/etc/ssl/certs/localhost.crt:certKey=/etc/ssl/certs/localhost.key
daphne -e ssl:443:privateKey=/etc/ssl/certs/localhost.crt:certKey=/etc/ssl/certs/localhost.key -b 0.0.0.0 -p 8001 myproject.asgi:application & gunicorn myproject.wsgi:application --bind 0.0.0.0:8000 --certfile "/etc/ssl/certs/localhost.crt" --keyfile "/etc/ssl/certs/localhost.key" --workers 4 --timeout 300
