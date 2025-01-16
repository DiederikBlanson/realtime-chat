docker run \
  --name redis-container \
  --network chat_network \
  -p 6379:6379 \
  -d \
  redis:latest