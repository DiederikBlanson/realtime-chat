#!/bin/bash
set -euo pipefail

# Require necessary env vars
: "${KIBANA_USER:?Environment variable KIBANA_USER not set}"
: "${KIBANA_PASS:?Environment variable KIBANA_PASS not set}"
: "${LOGSTASH_USER:?Environment variable LOGSTASH_USER not set}"
: "${LOGSTASH_PASS:?Environment variable LOGSTASH_PASS not set}"

# Wait for Elasticsearch to be available
until curl -s http://localhost:9200 >/dev/null; do
  echo "⏳ Waiting for Elasticsearch..."
  sleep 2
done

# Create Kibana user
echo "👤 Creating Kibana user: $KIBANA_USER"
bin/elasticsearch-users useradd "$KIBANA_USER" -p "$KIBANA_PASS" -r kibana_system || true

# Create Logstash user
echo "👤 Creating Logstash user: $LOGSTASH_USER"
bin/elasticsearch-users useradd "$LOGSTASH_USER" -p "$LOGSTASH_PASS" -r logstash_system || true

echo "✅ User setup complete."