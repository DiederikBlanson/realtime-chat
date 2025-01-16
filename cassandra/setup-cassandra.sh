docker pull cassandra

# remove old 
docker stop cassandra
docker rm cassandra

# create cassandra
docker run --name cassandra -p 127.0.0.1:9042:9042 -p 127.0.0.1:9160:9160 --network chat_network -d cassandra
docker cp data.cql cassandra:/data.cql

# Loop to retry running the CQL script
while true; do
    docker exec cassandra /opt/cassandra/bin/cqlsh -u cassandra -p cassandra -f /data.cql 

    # Check the exit code of the cqlsh command
    if [ $? -eq 0 ]; then
        echo "CQL script executed successfully. Exiting loop."
        break
    else
        echo "Cassandra still setting up. Retrying in 5 seconds..."
        sleep 5
    fi
done

echo "we are done!"
