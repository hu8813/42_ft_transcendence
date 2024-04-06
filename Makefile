up: check_env
	$(eval VOLUME_PATH := $(HOME)/volumes)
	mkdir -p $(HOME)/volumes/grafana
	mkdir -p $(HOME)/volumes/prometheus
	open https://localhost:8443/ || true
#	@open https://localhost:3000/ || true
#	@open http://localhost:9090/ || true
#	@echo "Open: https://localhost:8443/"
	docker compose up


check_env:
	@if [ ! -f ".env" ]; then \
		if [ -f "sample.env" ]; then \
			cp sample.env .env; \
			echo "Copied sample.env to .env"; \
		else \
			echo "sample.env not found, please create it"; \
		fi; \
		./src/check_env.sh; \
	fi


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
