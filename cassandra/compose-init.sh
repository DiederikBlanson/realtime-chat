#!/usr/bin/env bash

while true; do
    cqlsh cassandra -u cassandra -p cassandra -f /data.cql

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