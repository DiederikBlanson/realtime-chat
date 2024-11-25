# Running the Application

Before you start the application, ensure that you have the following modules installed on your system:

- [npm](https://www.npmjs.com/)
- [Redis](https://redis.io/)
- [Docker](https://www.docker.com/)


Follow these steps to set up and run the application:

**Step 1:** Open Terminal 1 and execute the following command to start the RabbitMQ cluster:
```bash
sh rabbitmq/setup-rabbit.sh
```


**Step 2:** Open Terminal 2 and execute the following command to start the Redis server:

```bash
sh redis/setup-redis.sh
```


**Step 3:**  Open Terminal 3 and execute the following command to start the Cassandra cluster:

```bash
cd cassandra
sh setup-cassandra.sh
```


**Step 4:**  Wait until the RabbitMQ, Redis, and Cassandra services have fully started. This may take a moment.


**Step 5:**  Open Terminal 4 and run the following commands to start the chat application:

```bash
cd chat-sd/app
npm install
npm run dev
```


**Step 6:**  Open Terminal 5 and run the following commands to start the messages service:

```bash
cd messages-service/app
npm install
npm run dev
```

**Step 7:**  Open Terminal 6 and run the following commands to start the WebSocket server. You can specify a custom port (e.g., PORT=4321) for the WebSocket server:

```bash
cd chat-ws/app
npm install
PORT=4321 npm run dev
```

You can add more WebSocket servers by running PORT={other_port} npm run dev in additional terminals.

**Step 8:**  Open Terminal 7 and run the following commands to start the client app.

```bash
cd chat-web/app
npm install
npm start
```

**Step 9:** Finally, open Terminal 8 and run the following commands to start the presence server.

```bash
cd presence-server/app
npm install
npm start
```

Now, your application is up and running, and you can access the client app in your web browser at http://localhost:3000!