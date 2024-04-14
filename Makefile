up: check_env check_certs
	$(eval VOLUME_PATH := $(HOME)/volumes)
	mkdir -p $(HOME)/volumes/grafana
	mkdir -p $(HOME)/volumes/prometheus
	open https://localhost:8443/ || true
#	@open https://localhost:3000/ || true
#	@open http://localhost:9090/ || true
#	@echo "Open: https://localhost:8443/"
	docker compose up


check_certs:
	@if [ ! -f "certs/localhost.crt" ] || [ ! -f "certs/localhost.key" ]; then \
		echo "Generating self-signed certificates..."; \
		mkdir -p certs; \
		openssl req -x509 -nodes -days 365 -newkey rsa:2048 -keyout certs/localhost.key -out certs/localhost.crt -subj "/C=AT/ST=W/L=Vienna/O=Pong42/OU=IT Department/CN=localhost"; \
		echo "Certificates generated."; \
	fi

check_env:
	@if [ ! -f ".env" ]; then \
		./src/check_env.sh; \
	fi


down:
	docker compose down

clean:
	@docker compose down --volumes
	@echo "Stopping and removing specific containers..."
	@docker stop pong42-nginx pong42-backend postgres > /dev/null 2>&1 || true
	@docker rm pong42-nginx pong42-backend postgres > /dev/null 2>&1 || true
	@docker image rm pong42-nginx pong42-backend postgres > /dev/null 2>&1 || true
	@echo "Removing volumes associated with the containers..."
	@VOLUMES=$$(docker volume ls -q | grep -E 'pong42-(nginx|backend|postgres)'); \
	if [ -n "$$VOLUMES" ]; then \
		docker volume rm $$VOLUMES > /dev/null 2>&1; \
	else \
		echo "No volumes to remove."; \
	fi
	@echo "Clean-up done."


re: down check_env check_certs
	docker compose up --build

.PHONY: re clean up down
