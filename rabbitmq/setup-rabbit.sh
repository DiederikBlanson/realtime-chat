docker stop rabbitmq 
docker rm rabbitmq
docker run -it --rm \
  --name rabbitmq \
  -d \
  --network chat-net \
  -p 5672:5672 \
  -p 15672:15672 \
  rabbitmq:3.12-management