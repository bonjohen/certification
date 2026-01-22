#!/bin/bash
# Randomize answers for all exams and capture output to log file
# Usage: ./run_randomize_all.sh

set -e

# Get script directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Generate timestamp for log filename
TIMESTAMP=$(date +"%Y-%m-%d_%H%M%S")

# Set paths
LOG_DIR="$PROJECT_ROOT/log/randomize"
LOG_FILE="$LOG_DIR/randomize_${TIMESTAMP}.log"

# Create log directory if it doesn't exist
mkdir -p "$LOG_DIR"

echo "Randomizing exam answers..."
echo "Log file: $LOG_FILE"
echo

# Run the randomization script and capture all output
if python "$SCRIPT_DIR/randomize_answers.py" > "$LOG_FILE" 2>&1; then
    echo "[OK] Randomization complete. See log for details."
else
    EXIT_CODE=$?
    echo "[ERROR] Randomization failed with exit code $EXIT_CODE"
fi

echo
echo "Log saved to: $LOG_FILE"
