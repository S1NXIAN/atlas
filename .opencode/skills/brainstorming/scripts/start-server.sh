#!/usr/bin/env bash
# Start the brainstorm server
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"
SESSION_ID="$$-$(date +%s)"
SESSION_DIR="/tmp/brainstorm-${SESSION_ID}"
STATE_DIR="${SESSION_DIR}/state"
PID_FILE="${STATE_DIR}/server.pid"

mkdir -p "${SESSION_DIR}/content" "$STATE_DIR"
cd "$SCRIPT_DIR"

OWNER_PID="$(ps -o ppid= -p "$PPID" 2>/dev/null | tr -d ' ')"
[[ -z "$OWNER_PID" || "$OWNER_PID" == "1" ]] && OWNER_PID="$PPID"

nohup env BRAINSTORM_DIR="$SESSION_DIR" BRAINSTORM_OWNER_PID="$OWNER_PID" node server.cjs > "${STATE_DIR}/server.log" 2>&1 &
SERVER_PID=$!
disown "$SERVER_PID" 2>/dev/null
echo "$SERVER_PID" > "$PID_FILE"

for i in {1..50}; do
  if grep -q "server-started" "${STATE_DIR}/server.log" 2>/dev/null; then
    grep "server-started" "${STATE_DIR}/server.log" | head -1
    exit 0
  fi
  sleep 0.1
done

echo '{"error": "Server failed to start within 5 seconds"}'
exit 1
