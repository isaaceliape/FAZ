#!/bin/bash
#
# FASE Tmux Test Runner
#
# Runs all tmux-based installation tests and reports results.
# Exit codes:
#   0 - All tests passed
#   1 - One or more tests failed
#

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"

# Colors
RESET='\033[0m'
GREEN='\033[32m'
RED='\033[31m'
YELLOW='\033[33m'
CYAN='\033[36m'
BOLD='\033[1m'

echo ""
echo -e "${BOLD}${CYAN}╔════════════════════════════════════════════════════════╗${RESET}"
echo -e "${BOLD}${CYAN}║${RESET}  ${BOLD}FASE Tmux Test Suite${RESET}                              ${CYAN}║${RESET}"
echo -e "${BOLD}${CYAN}╚════════════════════════════════════════════════════════╝${RESET}"
echo ""

# Check if tmux is available
if ! command -v tmux &> /dev/null; then
    echo -e "${RED}✗ tmux not found${RESET}"
    echo -e "${DIM}  Please install tmux:${RESET}"
    echo -e "${DIM}    macOS: brew install tmux${RESET}"
    echo -e "${DIM}    Linux: apt install tmux / yum install tmux${RESET}"
    echo ""
    exit 1
fi

echo -e "${GREEN}✓${RESET} tmux available"
echo ""

# Change to project root
cd "$PROJECT_ROOT"

# Run tests using the runner
echo -e "${CYAN}Running tests...${RESET}"
echo ""

node test/tmux-runner.cjs --all
