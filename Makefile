up:
	@if [ ! -f ".env" ] || [ ! -f "backend/.env" ]; then \
		./src/check_env.sh; \
	fi
	@export VOLUME_PATH=$HOME/volumes 	
	@mkdir -p $HOME/volumes/grafana
	@mkdir -p $HOME/volumes/prometheus
	@open https://localhost:8443/ || true
#	@open https://localhost:3000/ || true
#	@open http://localhost:9090/ || true
#	@echo "Open: https://localhost:8443/"
	docker compose up

down:
	docker compose down

clean:
	@docker compose down --volumes
	@echo "Stopping and removing specific containers..."
	@docker stop tmp-nginx tmp-backend postgres > /dev/null 2>&1 || true
	@docker rm tmp-nginx tmp-backend postgres > /dev/null 2>&1 || true
	@docker image rm tmp-nginx tmp-backend postgres > /dev/null 2>&1 || true
	@echo "Removing volumes associated with the containers..."
	@VOLUMES=$$(docker volume ls -q | grep -E 'tmp-(nginx|backend|postgres)'); \
	if [ -n "$$VOLUMES" ]; then \
		docker volume rm $$VOLUMES > /dev/null 2>&1; \
	else \
		echo "No volumes to remove."; \
	fi
	@echo "Clean-up done."


re: down
	docker compose up --build

.PHONY: re clean up down
