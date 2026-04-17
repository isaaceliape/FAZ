#!/bin/bash

# FASE Docker Test Runner
# Tests installation in clean Docker environments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# Functions
print_header() {
    echo -e "\n${YELLOW}=== $1 ===${NC}\n"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_error() {
    echo -e "${RED}✗ $1${NC}"
}

# Check for Docker
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed"
    exit 1
fi

print_header "FASE Docker Test Suite"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
cd "$SCRIPT_DIR/.."

# Options
RUN_ALL=false
RUN_TESTS=false
RUN_CLAUDE=false
RUN_OPENCODE=false
RUN_GEMINI=false
RUN_CODEX=false
RUN_ALL_PROVIDERS=false
RUN_UBUNTU=false
RUN_ALPINE=false
CLEANUP=false

# Parse arguments
while [[ $# -gt 0 ]]; do
    case $1 in
        --all)
            RUN_ALL=true
            shift
            ;;
        --tests)
            RUN_TESTS=true
            shift
            ;;
        --claude)
            RUN_CLAUDE=true
            shift
            ;;
        --opencode)
            RUN_OPENCODE=true
            shift
            ;;
        --gemini)
            RUN_GEMINI=true
            shift
            ;;
        --codex)
            RUN_CODEX=true
            shift
            ;;
        --all-providers)
            RUN_ALL_PROVIDERS=true
            shift
            ;;
        --ubuntu)
            RUN_UBUNTU=true
            shift
            ;;
        --alpine)
            RUN_ALPINE=true
            shift
            ;;
        --cleanup)
            CLEANUP=true
            shift
            ;;
        --help)
            echo "Usage: ./run-docker-tests.sh [options]"
            echo ""
            echo "Options:"
            echo "  --all              Run all tests"
            echo "  --tests            Run test suite only"
            echo "  --claude           Test Claude installation"
            echo "  --opencode         Test OpenCode installation"
            echo "  --gemini           Test Gemini installation"
            echo "  --codex            Test Codex installation"
            echo "  --all-providers    Test all providers"
            echo "  --ubuntu           Run tests on Ubuntu"
            echo "  --alpine           Run tests on Alpine"
            echo "  --cleanup          Remove test containers and volumes"
            echo "  --help             Show this help message"
            echo ""
            echo "Examples:"
            echo "  ./run-docker-tests.sh --all              # Run everything"
            echo "  ./run-docker-tests.sh --claude --opencode # Test specific providers"
            echo "  ./run-docker-tests.sh --ubuntu           # Test on Ubuntu only"
            exit 0
            ;;
        *)
            echo "Unknown option: $1"
            exit 1
            ;;
    esac
done

# If no options specified, run all
if [ "$RUN_ALL" = true ]; then
    RUN_TESTS=true
    RUN_CLAUDE=true
    RUN_OPENCODE=true
    RUN_GEMINI=true
    RUN_CODEX=true
    RUN_ALL_PROVIDERS=true
    RUN_UBUNTU=true
    RUN_ALPINE=true
fi

# Cleanup
if [ "$CLEANUP" = true ]; then
    print_header "Cleaning up test containers and volumes"
    docker-compose -f test/docker-compose.yml down -v --remove-orphans || true
    print_success "Cleanup complete"
    exit 0
fi

# Run test suite
if [ "$RUN_TESTS" = true ]; then
    print_header "Running Test Suite"
    docker-compose -f test/docker-compose.yml run --rm test && \
        print_success "Test suite passed" || \
        print_error "Test suite failed"
fi

# Run Claude test
if [ "$RUN_CLAUDE" = true ]; then
    print_header "Testing Claude Installation"
    docker-compose -f test/docker-compose.yml run --rm claude-test && \
        print_success "Claude test passed" || \
        print_error "Claude test failed"
fi

# Run OpenCode test
if [ "$RUN_OPENCODE" = true ]; then
    print_header "Testing OpenCode Installation"
    docker-compose -f test/docker-compose.yml run --rm opencode-test && \
        print_success "OpenCode test passed" || \
        print_error "OpenCode test failed"
fi

# Run Gemini test
if [ "$RUN_GEMINI" = true ]; then
    print_header "Testing Gemini Installation"
    docker-compose -f test/docker-compose.yml run --rm gemini-test && \
        print_success "Gemini test passed" || \
        print_error "Gemini test failed"
fi

# Run Codex test
if [ "$RUN_CODEX" = true ]; then
    print_header "Testing Codex Installation"
    docker-compose -f test/docker-compose.yml run --rm codex-test && \
        print_success "Codex test passed" || \
        print_error "Codex test failed"
fi

# Run all providers test
if [ "$RUN_ALL_PROVIDERS" = true ]; then
    print_header "Testing All Providers Installation"
    docker-compose -f test/docker-compose.yml run --rm all-test && \
        print_success "All providers test passed" || \
        print_error "All providers test failed"
fi

# Run Ubuntu test
if [ "$RUN_UBUNTU" = true ]; then
    print_header "Testing on Ubuntu"
    docker-compose -f test/docker-compose.yml run --rm ubuntu-test && \
        print_success "Ubuntu tests passed" || \
        print_error "Ubuntu tests failed"
fi

# Run Alpine test
if [ "$RUN_ALPINE" = true ]; then
    print_header "Testing on Alpine"
    docker-compose -f test/docker-compose.yml run --rm alpine-test && \
        print_success "Alpine tests passed" || \
        print_error "Alpine tests failed"
fi

print_header "Test Suite Complete"
print_success "All requested tests completed"
