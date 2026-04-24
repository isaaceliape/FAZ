#!/bin/bash

# Test script to verify FASE commands are discoverable in Copilot TUI
# Run this in tmux to test interactive command discovery

cd /Users/isaaceliape/repos/FASE

echo "================================================================"
echo "FASE Copilot Commands Discovery Test"
echo "================================================================"
echo ""
echo "Starting Copilot CLI in interactive mode..."
echo "Instructions:"
echo "  1. Wait for Copilot to fully load (watch for 'Environment loaded')"
echo "  2. Type: /fase-"
echo "  3. Watch for autocomplete suggestions to appear"
echo "  4. Try: /fase-novo-projeto"
echo "  5. Try: /fase-planejar-etapa"
echo ""
echo "Commands available:"
ls -1 ./.copilot/commands/fase-*.md | wc -l | xargs echo "Total commands:"
ls -1 ./.copilot/commands/fase-*.md | head -5
echo "... and more"
echo ""
echo "Starting Copilot..."
echo "================================================================"
echo ""

copilot
