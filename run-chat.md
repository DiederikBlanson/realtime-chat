# Running the Application

Before you start the application, ensure that you have the following modules installed on your system:

- [npm](https://www.npmjs.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)


Follow these steps to set up and run the application:

---
**Step 1:** Create a Docker network
```bash
docker network create chat_network
```

---
**Step 2:** Open Terminal 1 and execute the following command to start the RabbitMQ cluster:
```bash
sh rabbitmq/setup-rabbit.sh
```

---
**Step 3:** Open Terminal 2 and execute the following command to start the Redis server:

```bash
sh redis/setup-redis.sh
```


**Step 4:**  Open Terminal 3 and execute the following command to start the Cassandra cluster:

```bash
cd cassandra
sh setup-cassandra.sh
```


**Step 5:**  Wait until the RabbitMQ, Redis, and Cassandra services have fully started. This may take a moment.


**Step 6:**  Open Terminal 4 and run the following commands to start the chat application:

```bash
docker run \
    -p 8888:8888 \
    -d \
    -e FRONTEND_URL=http://localhost:3000 \
    -e REDIS_HOST=redis-container \
    -e REDIS_PORT=6379 \
    --network chat_network \
    chat-sd
```

---
**Step 7:**  Open Terminal 5 and run the following commands to start the messages service:

```bash
docker run \
    -p 5678:5678 \
    -d \
    -e FRONTEND_URL=http://localhost:3000 \
    -e RABBITMQ_URL=amqp://rabbitmq \
    -e CASSANDRA_POINT=cassandra \
    --network chat_network \
    chat-messages
```

---
**Step 8:**  Open Terminal 6 and run the following commands to start the WebSocket server. You can specify a custom port (e.g., PORT=4321) for the WebSocket server:

```bash
cd chat-ws/app
npm install
PORT=4321 npm run dev
```

or

```bash
docker run \
    -p 4321:4321 \
    -d \
    -e SERVER_HOST=http://localhost:7777 \
    -e REDIS_HOST=redis-container \
    -e REDIS_PORT=6379 \
    -e PORT=4321 \
    -e RABBITMQ_URL=amqp://rabbitmq \
    --network chat_network \
    chat-ws
```

You can add more WebSocket servers by running PORT={other_port} npm run dev in additional terminals.

---
**Step 9:**  Open Terminal 7 and run the following commands to start the client app.

```bash
cd chat-web/app
npm install
npm start
```

or 

```bash
docker run \
    -p 3000:80 \
    -d \
    -e VITE_APP_SERVICE_DISCOVERY_URL=http://localhost:8888 \
    -e VITE_APP_MESSAGING_SERVICE_URL=http://localhost:5678 \
    -e VITE_APP_PRESENCE_URL=http://localhost:7777 \
    --network chat_network \
    chat-web
```

---
**Step 10:** Finally, open Terminal 8 and run the following commands to start the presence server.

```bash
cd chat-presence/app
npm install
npm run dev
```

or

```bash
docker run \
    -p 7777:7777 \
    -d \
    -e FRONTEND_URL=http://localhost:3000 \
    -e RABBITMQ_URL=amqp://rabbitmq \
    -e CASSANDRA_POINT=cassandra \
    --network chat_network \
    chat-presence
```

---
Now, your application is up and running, and you can access the client app in your web browser at http://localhost:3000!