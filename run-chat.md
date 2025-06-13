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
cd chat-sd/app
npm install
npm run dev
```

---
**Step 7:**  Open Terminal 5 and run the following commands to start the messages service:

```bash
cd chat-messages/app
npm install
npm run dev
```

---
**Step 8:**  Open Terminal 6 and run the following commands to start the WebSocket server. You can specify a custom port (e.g., PORT=4321) for the WebSocket server:

```bash
cd chat-ws/app
npm install
PORT=4321 npm run dev
```

You can add more WebSocket servers by running PORT={other_port} npm run dev in additional terminals.

---
**Step 9:**  Open Terminal 7 and run the following commands to start the client app.

```bash
cd chat-web/app
npm install
npm start
```

---
**Step 10:** Open Terminal 8 and run the following commands to start the presence server.

```bash
cd chat-presence/app
npm install
npm run dev
```

---
**Step 11:** Finally, run the Federated Graph with the following commands:

```bash
cd mesh
npx mesh-compose -o supergraph.graphql
npx hive-gateway supergraph
```

---
Congratz! Your application is up and running, and you can access the client app in your web browser at http://localhost:3000!


## Optional: Monitoring
To enable Prometheus and Grafana, perform the following steps.

---
**Step 12:** Run Prometheus with the following command (first one for a local installation in the folder `prometheus/build`):

```bash
cd prometheus/build
./prometheus --config.file=prometheus.yml
```

or 

```bash
docker run \
    --name prometheus \
    -p 9090:9090 \
    -v $(pwd)/prometheus/config.yml:/etc/prometheus/prometheus.yml:ro \
    --network chat_network \
    prom/prometheus:latest
```

---
**Step 13:** Run Grafana with the following command (first one for a local installation in the folder `grafana`):

```bash
cd grafana
GF_SERVER_HTTP_PORT=6767 ./bin/grafana server
```

or

```bash
docker run \
    --name=grafana \
    -p 6767:3000 \
    --network chat_network \
    grafana/grafana-oss:latest
```

---
Now, you can access some additional monitoring tools:
- Prometheus on http://localhost:9090
- Grafana on http://localhost:6767