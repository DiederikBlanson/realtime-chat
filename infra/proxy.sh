pkill -f "kubectl port-forward"
kubectl port-forward svc/cassandra 9042:9042 9160:9160 & \
kubectl port-forward svc/redis-container 6379:6379 & \
kubectl port-forward svc/rabbitmq 5672:5672 15672:15672 & \
kubectl port-forward svc/chat-sd 8888:8888 & \
kubectl port-forward svc/chat-messages 5678:5678 & \
kubectl port-forward svc/chat-ws 4321:4321 & \
kubectl port-forward svc/chat-web 3000:80 & \
kubectl port-forward svc/chat-presence 7777:7777