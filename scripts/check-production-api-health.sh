#!/usr/bin/env bash
set -euo pipefail

api_base="${PRODUCTION_API_URL:-}"
if [[ -z "$api_base" ]]; then
  echo "PRODUCTION_API_URL is required for this check."
  exit 1
fi
api_base="${api_base%/}"

# Treat the secret as an origin, not an API path. Never print it: Actions masks
# exact secret values, but a derived or malformed URL might not be masked.
PRODUCTION_API_URL="$api_base" python3 - <<'PY'
import os
from urllib.parse import urlsplit

url = urlsplit(os.environ["PRODUCTION_API_URL"])
if (url.scheme != "https" or not url.hostname or url.username or url.password
        or url.path not in ("", "/") or url.query or url.fragment):
    raise SystemExit("PRODUCTION_API_URL must be an HTTPS origin without credentials, path, query, or fragment.")
PY

deadline=$((SECONDS + 120))
attempt=0
health_url="$api_base/api/health"
while (( SECONDS < deadline )); do
  attempt=$((attempt + 1))
  set +e
  response_with_status="$(curl --silent --show-error --connect-timeout 5 --max-time 10 \
    -H 'Accept: application/json' -w $'\n%{http_code}' "$health_url" 2>/dev/null)"
  curl_status=$?
  set -e

  if (( curl_status == 0 )); then
    http_status="${response_with_status##*$'\n'}"
    response="${response_with_status%$'\n'*}"
    if HEALTH_RESPONSE="$response" HEALTH_HTTP_STATUS="$http_status" python3 - <<'PY'
import json
import os

try:
    body = json.loads(os.environ["HEALTH_RESPONSE"])
except (json.JSONDecodeError, KeyError):
    raise SystemExit(1)

status = int(os.environ["HEALTH_HTTP_STATUS"])
if (status == 200 and body.get("success") is True
        and body.get("status") == "healthy"
        and body.get("database") == "connected"):
    print(json.dumps(body, separators=(",", ":")))
    raise SystemExit(0)

if (status == 503 and body.get("success") is False
        and body.get("status") == "starting" and body.get("startup") == "starting"
        and body.get("database") in {"connecting", "disconnected"}):
    raise SystemExit(2)

if (status == 503 and body.get("success") is False
        and body.get("status") == "degraded" and body.get("startup") == "ready"
        and body.get("database") in {"connecting", "disconnecting", "disconnected"}):
    raise SystemExit(2)

raise SystemExit(1)
PY
    then
      result=0
    else
      result=$?
    fi
    if (( result == 0 )); then
      echo "Production API is healthy and MongoDB is connected."
      exit 0
    elif (( result != 2 )); then
      echo "Production API returned an invalid health response (HTTP ${http_status})."
      exit 1
    fi
    echo "Production API is reachable but not ready yet (attempt ${attempt}, HTTP ${http_status})."
  else
    echo "Production API did not respond yet (attempt ${attempt}, curl exit ${curl_status})."
  fi

  if (( SECONDS >= deadline )); then break; fi
  sleep 5
done

echo "Production API did not become healthy with a connected MongoDB within 120 seconds. Check the GitHub Actions URL secret and Render service configuration/logs."
exit 1
