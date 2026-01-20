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

# Read transcript and find last assistant message
while IFS= read -r line; do
  msg_type=$(echo "$line" | jq -r '.type // empty' 2>/dev/null)
  msg_role=$(echo "$line" | jq -r '.message.role // empty' 2>/dev/null)

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

# Write the log file
echo "$last_assistant_msg" > "$log_file"

exit 0
