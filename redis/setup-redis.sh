docker run \
  --name redis-container \
  --network chat-net \
  -p 6379:6379 \
  -d \
  redis:latest