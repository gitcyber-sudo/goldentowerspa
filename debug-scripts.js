#!/usr/bin/env node

/**
 * Debug script for Playwright tests
 * This script provides various debugging utilities for your spa booking system
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const DEBUG_SCRIPTS = {
  'run-with-trace': {
    description: 'Run tests with trace for debugging',
    command: 'npx playwright test --trace on'
  },
  'run-with-screenshot': {
    description: 'Run tests with screenshots on failure',
    command: 'npx playwright test --screenshot on-failure'
  },
  'run-with-headless': {
    description: 'Run tests in headless mode for CI',
    command: 'npx playwright test --headed'
  },
  'run-specific-test': {
    description: 'Run a specific test file',
    command: 'npx playwright test {filename}'
  },
  'run-with-debugger': {
    description: 'Run tests with debugger attached',
    command: 'npx playwright test --debug'
  },
  'show-test-report': {
    description: 'Show HTML test report',
    command: 'npx playwright show-report'
  },
  'install-browsers': {
    description: 'Install Playwright browsers',
    command: 'npx playwright install'
  },
  'clean-test-results': {
    description: 'Clean test results directory',
    command: 'rm -rf test-results && mkdir test-results'
  }
};

function showHelp() {
  console.log('🎭 Playwright Debug Scripts for Golden Tower Spa');
  console.log('=============================================\n');
  
  console.log('Available commands:');
  Object.entries(DEBUG_SCRIPTS).forEach(([key, script]) => {
    console.log(`  ${key.padEnd(20)} ${script.description}`);
  });
  
  console.log('\nUsage:');
  console.log('  node debug-scripts.js <command> [args]');
  console.log('\nExamples:');
  console.log('  node debug-scripts.js run-with-trace');
  console.log('  node debug-scripts.js run-specific-test booking.spec.ts');
  console.log('  node debug-scripts.js show-test-report');
}

function runCommand(command, args = []) {
  try {
    if (command.includes('{filename}')) {
      const filename = args[0] || 'booking.spec.ts';
      command = command.replace('{filename}', filename);
    }
    
    console.log(`🚀 Running: ${command}`);
    execSync(command, { stdio: 'inherit' });
  } catch (error) {
    console.error(`❌ Error running command: ${command}`);
    console.error(error.message);
    process.exit(1);
  }
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0 || args[0] === 'help') {
    showHelp();
    return;
  }
  
  const commandKey = args[0];
  const script = DEBUG_SCRIPTS[commandKey];
  
  if (!script) {
    console.error(`❌ Unknown command: ${commandKey}`);
    showHelp();
    return;
  }
  
  runCommand(script.command, args.slice(1));
}

if (require.main === module) {
  main();
}

module.exports = { DEBUG_SCRIPTS, runCommand, showHelp };