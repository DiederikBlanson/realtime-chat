FROM cassandra:latest

COPY compose-init.sh /compose-init.sh
COPY data.cql /data.cql

RUN chmod +x /compose-init.sh

ENTRYPOINT ["/compose-init.sh"]
