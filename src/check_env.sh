#!/bin/bash

env_file=".env"

#touch "$env_file" backend/.env

read_var_from_env_file() {
    local var_name=$1
    grep "^${var_name}=" "$env_file" | sed -E "s/^${var_name}=(.*)/\1/" | tail -1
}

prompt_for_variable() {
    local var_name=$1
    local prompt_message=$2
    local current_value

    # Check if the variable is already set in the environment
    current_value="${!var_name}"

    # If not set in the environment, check the .env file
    if [ -z "$current_value" ]; then
        current_value=$(read_var_from_env_file "$var_name")
    fi

    # If not set anywhere, prompt the user (if a prompt message is provided)
    if [ -z "$current_value" ] && [ -n "$prompt_message" ]; then
        echo -e -n "${prompt_message}"
        read current_value
    fi

    # Update or add the variable to the .env file
    if ! grep -q "^${var_name}=" "$env_file"; then
        echo "$var_name=$current_value" >> "$env_file"
    else
        # Update the value in the .env file directly
        sed -i "/^$var_name=/c\\$var_name=$current_value" "$env_file"
    fi
}

set_default_variable() {
    local var_name=$1
    local default_value=$2
    
    if ! grep -q "^${var_name}=" "$env_file"; then
        echo "$var_name=$default_value" >> "$env_file"
    else
        sed -i "/^$var_name=/c\\$var_name=$default_value" "$env_file"
    fi
}

prompt_for_variable POSTGRES_HOST "Enter PostgreSQL host: "
prompt_for_variable POSTGRES_USER "Enter PostgreSQL user: "
prompt_for_variable PGPASSWORD "Enter PostgreSQL password: "
prompt_for_variable POSTGRES_DB "Enter PostgreSQL database name: "

prompt_for_variable SECRET_KEY "Enter Django secret key: "
prompt_for_variable CLIENT_ID "Enter OAuth Client ID: "
prompt_for_variable CLIENT_SECRET "Enter OAuth Client Secret: "
prompt_for_variable REDIRECT_URI "Enter OAuth Redirect URI: "

set_default_variable BACKEND_URL "http://localhost:8000"
set_default_variable POSTGRES_PORT "5432"

pgpassword_value=$(read_var_from_env_file PGPASSWORD)
set_default_variable POSTGRES_PASSWORD "$pgpassword_value"

cp $env_file backend/.env
echo "Environment variables have been updated in $env_file."

