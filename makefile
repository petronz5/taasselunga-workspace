====================================
DOCKER COMPOSE
====================================
AVVIO DOCKER COMPOSE:docker compose up
CHIUSURA DOCKER COMPOSE : docker compose down
CONTROLLO CONFIGURAZIONE DOCKER COMPOSE: docker compose config


====================================
KUBERNETES
====================================
CONTROLLO CLUSTER KUBERNETES: kubectl get nodes
AVVIO KUBERNETES: kubectl apply -f k8s/
CONTROLLO POD KUBERNETES: kubectl get pods
CONTROLLO SERVIZI KUBERNETES: kubectl get svc
CONTROLLO PVC POSTGRES (persitenza): kubectl get pvc

PORT FORWARD FRONTEND: kubectl port-forward service/taasselunga-frontend 3000:3000
PORT FORWARD API GATEWAY: kubectl port-forward service/taasselunga-api-gateway 8080:8080
PORT FORWARD NOTIFICATION SERVICE: kubectl port-forward service/notification-service 8083:8083


RIAVVIO COMPLETO DEPLOYMENT: kubectl rollout restart deployment

CONTROLLO PERSISTENZA DATABASE: kubectl get pods | findstr postgres

kubectl exec -it NOME_POD_POSTGRES -- psql -U root -d db_inventory -c "SELECT COUNT(*) FROM product;"
