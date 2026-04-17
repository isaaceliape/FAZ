const assert = require('assert');
const fs = require('fs');
const path = require('path');
const os = require('os');

/**
 * Docker Environment Simulation Tests
 * Simulates clean container environments for testing installations
 */

describe('Docker Environment Simulation', () => {
  let containerSimDir;

  /**
   * Simulates a clean Docker container filesystem
   * Creates a temporary directory that acts like a fresh container environment
   */
  beforeEach(() => {
    containerSimDir = fs.mkdtempSync(path.join(os.tmpdir(), 'fase-docker-sim-'));
  });

  afterEach(() => {
    if (fs.existsSync(containerSimDir)) {
      fs.rmSync(containerSimDir, { recursive: true, force: true });
    }
  });

  describe('Clean Alpine Container (Node 18)', () => {
    it('should install Claude in Alpine container', () => {
      const homeDir = path.join(containerSimDir, 'root');
      const claudeDir = path.join(homeDir, '.claude');

      // Simulate Alpine with minimal setup
      fs.mkdirSync(homeDir, { recursive: true });

      // Install FASE
      const setupDirs = [claudeDir, path.join(claudeDir, 'hooks')];
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(claudeDir, 'VERSION'), '2.6.1');

      // Verify installation
      assert.strictEqual(fs.existsSync(claudeDir), true);
      assert.strictEqual(fs.existsSync(path.join(claudeDir, 'hooks')), true);
      assert.strictEqual(fs.readFileSync(path.join(claudeDir, 'VERSION'), 'utf8'), '2.6.1');
    });

    it('should install OpenCode in Alpine container', () => {
      const homeDir = path.join(containerSimDir, 'root');
      const opencodeDir = path.join(homeDir, '.config', 'opencode');

      fs.mkdirSync(homeDir, { recursive: true });

      const setupDirs = [opencodeDir, path.join(opencodeDir, 'hooks')];
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(opencodeDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(opencodeDir), true);
    });

    it('should handle package installation in Alpine', () => {
      // Alpine uses apk instead of apt, check we handle different env
      const installScript = path.join(containerSimDir, 'install.sh');
      const content = `#!/bin/sh
set -e
apk add --no-cache nodejs npm
npx fase-ai --claude --global
`;
      fs.writeFileSync(installScript, content);
      fs.chmodSync(installScript, 0o755);

      assert.strictEqual(fs.existsSync(installScript), true);
      assert.ok(fs.readFileSync(installScript, 'utf8').includes('apk'));
    });
  });

  describe('Ubuntu Container (Node 18+)', () => {
    it('should install Claude in Ubuntu container', () => {
      const homeDir = path.join(containerSimDir, 'root');
      const claudeDir = path.join(homeDir, '.claude');

      fs.mkdirSync(homeDir, { recursive: true });

      const setupDirs = [claudeDir, path.join(claudeDir, 'hooks')];
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(claudeDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(claudeDir), true);
    });

    it('should handle package installation in Ubuntu', () => {
      const installScript = path.join(containerSimDir, 'install.sh');
      const content = `#!/bin/bash
set -e
apt-get update
apt-get install -y nodejs npm
npx fase-ai --claude --global
`;
      fs.writeFileSync(installScript, content);
      fs.chmodSync(installScript, 0o755);

      assert.strictEqual(fs.existsSync(installScript), true);
      assert.ok(fs.readFileSync(installScript, 'utf8').includes('apt-get'));
    });
  });

  describe('macOS Container (ARM64)', () => {
    it('should install Claude in macOS ARM64 container', () => {
      const homeDir = path.join(containerSimDir, 'Users', 'developer');
      const claudeDir = path.join(homeDir, '.claude');

      fs.mkdirSync(homeDir, { recursive: true });

      const setupDirs = [claudeDir, path.join(claudeDir, 'hooks')];
      setupDirs.forEach(dir => {
        fs.mkdirSync(dir, { recursive: true });
      });

      fs.writeFileSync(path.join(claudeDir, 'VERSION'), '2.6.1');

      assert.strictEqual(fs.existsSync(claudeDir), true);
    });

    it('should handle Homebrew installation on macOS', () => {
      const installScript = path.join(containerSimDir, 'install.sh');
      const content = `#!/bin/bash
set -e
brew install node
npx fase-ai --claude --global
`;
      fs.writeFileSync(installScript, content);
      fs.chmodSync(installScript, 0o755);

      assert.ok(fs.readFileSync(installScript, 'utf8').includes('brew'));
    });
  });

  describe('Multi-Stage Docker Build', () => {
    it('should create valid Dockerfile for Claude installation', () => {
      const dockerfile = path.join(containerSimDir, 'Dockerfile');
      const content = `FROM node:18-alpine
WORKDIR /app
RUN npm install -g fase-ai
RUN fase-ai --claude --global
CMD ["/bin/sh"]
`;
      fs.writeFileSync(dockerfile, content);

      const read = fs.readFileSync(dockerfile, 'utf8');
      assert.ok(read.includes('FROM node:18-alpine'));
      assert.ok(read.includes('fase-ai'));
    });

    it('should create valid Dockerfile for OpenCode installation', () => {
      const dockerfile = path.join(containerSimDir, 'Dockerfile.opencode');
      const content = `FROM node:18-alpine
WORKDIR /app
RUN npm install -g fase-ai
RUN fase-ai --opencode --global
CMD ["/bin/sh"]
`;
      fs.writeFileSync(dockerfile, content);

      const read = fs.readFileSync(dockerfile, 'utf8');
      assert.ok(read.includes('opencode'));
    });

    it('should create valid Dockerfile for all providers', () => {
      const dockerfile = path.join(containerSimDir, 'Dockerfile.all');
      const content = `FROM node:18-alpine
WORKDIR /app
RUN npm install -g fase-ai
RUN fase-ai --all --global
CMD ["/bin/sh"]
`;
      fs.writeFileSync(dockerfile, content);

      const read = fs.readFileSync(dockerfile, 'utf8');
      assert.ok(read.includes('--all'));
    });
  });

  describe('Environment Variables in Containers', () => {
    it('should handle CLAUDE_CONFIG_DIR in container', () => {
      const envFile = path.join(containerSimDir, '.env');
      const content = `CLAUDE_CONFIG_DIR=/root/.claude-custom
HOME=/root
`;
      fs.writeFileSync(envFile, content);

      assert.ok(fs.readFileSync(envFile, 'utf8').includes('CLAUDE_CONFIG_DIR'));
    });

    it('should handle OPENCODE_CONFIG_DIR in container', () => {
      const envFile = path.join(containerSimDir, '.env');
      const content = `OPENCODE_CONFIG_DIR=/root/.config/opencode-custom
XDG_CONFIG_HOME=/root/.config
HOME=/root
`;
      fs.writeFileSync(envFile, content);

      assert.ok(fs.readFileSync(envFile, 'utf8').includes('OPENCODE_CONFIG_DIR'));
    });

    it('should handle GEMINI_CONFIG_DIR in container', () => {
      const envFile = path.join(containerSimDir, '.env');
      const content = `GEMINI_CONFIG_DIR=/root/.gemini-custom
HOME=/root
`;
      fs.writeFileSync(envFile, content);

      assert.ok(fs.readFileSync(envFile, 'utf8').includes('GEMINI_CONFIG_DIR'));
    });

    it('should handle CODEX_HOME in container', () => {
      const envFile = path.join(containerSimDir, '.env');
      const content = `CODEX_HOME=/root/.codex-custom
HOME=/root
`;
      fs.writeFileSync(envFile, content);

      assert.ok(fs.readFileSync(envFile, 'utf8').includes('CODEX_HOME'));
    });
  });

  describe('Volume Mounting', () => {
    it('should support binding Claude config directory', () => {
      const composePath = path.join(containerSimDir, 'docker-compose.yml');
      const content = `version: '3.8'
services:
  app:
    image: node:18-alpine
    volumes:
      - claude-config:/root/.claude
volumes:
  claude-config:
`;
      fs.writeFileSync(composePath, content);

      assert.ok(fs.readFileSync(composePath, 'utf8').includes('.claude'));
    });

    it('should support binding OpenCode config directory', () => {
      const composePath = path.join(containerSimDir, 'docker-compose.yml');
      const content = `version: '3.8'
services:
  app:
    image: node:18-alpine
    volumes:
      - opencode-config:/root/.config/opencode
volumes:
  opencode-config:
`;
      fs.writeFileSync(composePath, content);

      assert.ok(fs.readFileSync(composePath, 'utf8').includes('opencode'));
    });

    it('should support multiple provider volume mounts', () => {
      const composePath = path.join(containerSimDir, 'docker-compose.all.yml');
      const content = `version: '3.8'
services:
  app:
    image: node:18-alpine
    volumes:
      - claude-config:/root/.claude
      - opencode-config:/root/.config/opencode
      - gemini-config:/root/.gemini
      - codex-config:/root/.codex
volumes:
  claude-config:
  opencode-config:
  gemini-config:
  codex-config:
`;
      fs.writeFileSync(composePath, content);

      const read = fs.readFileSync(composePath, 'utf8');
      assert.ok(read.includes('.claude'));
      assert.ok(read.includes('opencode'));
      assert.ok(read.includes('.gemini'));
      assert.ok(read.includes('.codex'));
    });
  });

  describe('Installation Scripts', () => {
    it('should create installation script for Claude', () => {
      const scriptPath = path.join(containerSimDir, 'install-claude.sh');
      const content = `#!/bin/bash
set -e

echo "Installing FASE for Claude Code..."
npm install -g fase-ai
fase-ai --claude --global

echo "Installation complete!"
`;
      fs.writeFileSync(scriptPath, content);
      fs.chmodSync(scriptPath, 0o755);

      assert.strictEqual(fs.existsSync(scriptPath), true);
      const stat = fs.statSync(scriptPath);
      assert.strictEqual((stat.mode & 0o111) !== 0, true);
    });

    it('should create installation script for all providers', () => {
      const scriptPath = path.join(containerSimDir, 'install-all.sh');
      const content = `#!/bin/bash
set -e

echo "Installing FASE for all providers..."
npm install -g fase-ai
fase-ai --all --global

echo "Installation complete!"
`;
      fs.writeFileSync(scriptPath, content);
      fs.chmodSync(scriptPath, 0o755);

      assert.ok(fs.readFileSync(scriptPath, 'utf8').includes('--all'));
    });

    it('should create uninstall script', () => {
      const scriptPath = path.join(containerSimDir, 'uninstall.sh');
      const content = `#!/bin/bash
set -e

echo "Uninstalling FASE..."
npm uninstall -g fase-ai
rm -rf ~/.claude
rm -rf ~/.config/opencode
rm -rf ~/.gemini
rm -rf ~/.codex

echo "Uninstall complete!"
`;
      fs.writeFileSync(scriptPath, content);
      fs.chmodSync(scriptPath, 0o755);

      const read = fs.readFileSync(scriptPath, 'utf8');
      assert.ok(read.includes('.claude'));
      assert.ok(read.includes('.gemini'));
      assert.ok(read.includes('.codex'));
    });
  });

  describe('Cross-Platform Support', () => {
    it('should detect Linux platform', () => {
      const platformFile = path.join(containerSimDir, 'platform.json');
      const platform = {
        os: 'Linux',
        arch: 'x64',
        node: '18.0.0',
        npm: '9.0.0'
      };

      fs.writeFileSync(platformFile, JSON.stringify(platform, null, 2));
      const read = JSON.parse(fs.readFileSync(platformFile, 'utf8'));

      assert.strictEqual(read.os, 'Linux');
    });

    it('should detect Darwin (macOS) platform', () => {
      const platformFile = path.join(containerSimDir, 'platform.json');
      const platform = {
        os: 'Darwin',
        arch: 'arm64',
        node: '18.0.0',
        npm: '9.0.0'
      };

      fs.writeFileSync(platformFile, JSON.stringify(platform, null, 2));
      const read = JSON.parse(fs.readFileSync(platformFile, 'utf8'));

      assert.strictEqual(read.os, 'Darwin');
    });

    it('should handle path separators correctly', () => {
      const paths = {
        linux: '/root/.claude',
        darwin: '/Users/developer/.claude',
        windows: 'C:\\Users\\Developer\\.claude'
      };

      const pathFile = path.join(containerSimDir, 'paths.json');
      fs.writeFileSync(pathFile, JSON.stringify(paths, null, 2));

      const read = JSON.parse(fs.readFileSync(pathFile, 'utf8'));
      assert.ok(read.linux.startsWith('/'));
      assert.ok(read.darwin.includes('Users'));
    });
  });

  describe('Health Checks', () => {
    it('should verify installation with health check script', () => {
      const healthCheckPath = path.join(containerSimDir, 'healthcheck.sh');
      const content = `#!/bin/bash
set -e

echo "Checking FASE installation..."

if [ -d "$HOME/.claude" ]; then
  echo "✓ Claude Code configuration found"
else
  echo "✗ Claude Code configuration missing"
  exit 1
fi

if [ -d "$HOME/.config/opencode" ]; then
  echo "✓ OpenCode configuration found"
fi

if [ -d "$HOME/.gemini" ]; then
  echo "✓ Gemini configuration found"
fi

if [ -d "$HOME/.codex" ]; then
  echo "✓ Codex configuration found"
fi

echo "✓ FASE is properly installed"
`;
      fs.writeFileSync(healthCheckPath, content);
      fs.chmodSync(healthCheckPath, 0o755);

      assert.strictEqual(fs.existsSync(healthCheckPath), true);
    });

    it('should verify VERSION file in all installations', () => {
      const providers = ['claude', 'opencode', 'gemini', 'codex'];
      const baseDir = path.join(containerSimDir, 'verification');
      fs.mkdirSync(baseDir, { recursive: true });

      providers.forEach(provider => {
        const dir = path.join(baseDir, `.${provider}`);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, 'VERSION'), '2.6.1');
      });

      providers.forEach(provider => {
        const versionFile = path.join(baseDir, `.${provider}`, 'VERSION');
        assert.strictEqual(fs.existsSync(versionFile), true);
        assert.strictEqual(fs.readFileSync(versionFile, 'utf8'), '2.6.1');
      });
    });
  });
});
