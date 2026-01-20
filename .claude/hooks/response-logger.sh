#!/bin/bash
#
# Claude Code Stop hook that logs the last assistant message
# to ./claude-logs/<timestamp>.md when the agent finishes responding
#

set -e

# Read hook input from stdin
input=$(cat)

# Parse input JSON
transcript_path=$(echo "$input" | jq -r '.transcript_path')
cwd=$(echo "$input" | jq -r '.cwd')

# Exit if no transcript
if [[ -z "$transcript_path" || "$transcript_path" == "null" || ! -f "$transcript_path" ]]; then
  exit 0
fi

# Create claude-logs directory in the project
log_dir="${CLAUDE_PROJECT_DIR:-$cwd}/claude-logs"
mkdir -p "$log_dir"

# Generate timestamp for filename
timestamp=$(date +"%Y-%m-%d-%H-%M")
log_file="$log_dir/$timestamp.md"

# Find the last assistant message in the transcript
# Look for entries with type "assistant" or role "assistant"
last_assistant_msg=""

# Read transcript and find last assistant message, plus timestamps
first_timestamp=""
last_timestamp=""

while IFS= read -r line; do
  msg_type=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
  msg_role=$(echo "$line" | jq -r '.message.role // empty' 2>/dev/null)
  msg_timestamp=$(echo "$line" | jq -r '.timestamp // empty' 2>/dev/null)

  # Track first timestamp
  if [[ -z "$first_timestamp" && -n "$msg_timestamp" && "$msg_timestamp" != "null" ]]; then
    first_timestamp="$msg_timestamp"
  fi

  # Track last timestamp
  if [[ -n "$msg_timestamp" && "$msg_timestamp" != "null" ]]; then
    last_timestamp="$msg_timestamp"
  fi

  if [[ "$msg_type" == "assistant" || "$msg_role" == "assistant" ]]; then
    # Extract text content
    content=$(echo "$line" | jq -r '
      .message.content // .content // empty |
      if type == "array" then
        map(select(.type == "text") | .text) | join("\n")
      elif type == "string" then
        .
      else
        empty
      end
    ' 2>/dev/null)

    if [[ -n "$content" && "$content" != "null" ]]; then
      last_assistant_msg="$content"
    fi
  fi
done < "$transcript_path"

# If we didn't find a message, note that
if [[ -z "$last_assistant_msg" ]]; then
  last_assistant_msg="(No assistant message found)"
fi

# Calculate duration if we have timestamps
duration_text=""
if [[ -n "$first_timestamp" && -n "$last_timestamp" && "$first_timestamp" != "null" && "$last_timestamp" != "null" ]]; then
  # Parse ISO 8601 timestamps to epoch seconds
  first_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$(echo "$first_timestamp" | cut -d. -f1)" "+%s" 2>/dev/null || echo "0")
  last_epoch=$(date -j -f "%Y-%m-%dT%H:%M:%S" "$(echo "$last_timestamp" | cut -d. -f1)" "+%s" 2>/dev/null || echo "0")

  if [[ "$first_epoch" != "0" && "$last_epoch" != "0" ]]; then
    duration_seconds=$((last_epoch - first_epoch))

    # Format duration as "Xm Ys" or just "Xs" if under a minute
    if [[ $duration_seconds -ge 60 ]]; then
      minutes=$((duration_seconds / 60))
      seconds=$((duration_seconds % 60))
      duration_text="✻ Baked for ${minutes}m ${seconds}s"
    else
      duration_text="✻ Baked for ${duration_seconds}s"
    fi
  fi
fi

# Write the log file
echo "$last_assistant_msg" > "$log_file"

# Append duration if available
if [[ -n "$duration_text" ]]; then
  echo "" >> "$log_file"
  echo "$duration_text" >> "$log_file"
fi

exit 0
