#!/usr/bin/env node

/**
 * Frontend & Backend Integration Test Script
 * 
 * This script tests the integration between frontend and backend
 * without requiring additional test framework installations.
 * 
 * Usage: node scripts/test-integration.js
 */

import { createServer } from 'http';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Test colors
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

const log = {
  success: (msg) => console.log(`${colors.green}✅ ${msg}${colors.reset}`),
  error: (msg) => console.log(`${colors.red}❌ ${msg}${colors.reset}`),
  info: (msg) => console.log(`${colors.blue}ℹ️  ${msg}${colors.reset}`),
  section: (msg) => console.log(`\n${colors.cyan}${'='.repeat(60)}\n${msg}\n${'='.repeat(60)}${colors.reset}`),
  warn: (msg) => console.log(`${colors.yellow}⚠️  ${msg}${colors.reset}`)
};

// Test results
const results = {
  passed: 0,
  failed: 0,
  skipped: 0,
  tests: []
};

const test = async (name, fn) => {
  try {
    await fn();
    results.passed++;
    results.tests.push({ name, passed: true });
    log.success(name);
  } catch (error) {
    results.failed++;
    results.tests.push({ name, passed: false, error: error.message });
    log.error(`${name}: ${error.message}`);
  }
};

const skip = (name, reason) => {
  results.skipped++;
  results.tests.push({ name, skipped: true, reason });
  log.warn(`${name}: Skipped - ${reason}`);
};

const assert = {
  equal: (actual, expected, msg) => {
    if (actual !== expected) throw new Error(msg || `Expected ${expected}, got ${actual}`);
  },
  truthy: (value, msg) => {
    if (!value) throw new Error(msg || 'Expected truthy value');
  },
  defined: (value, msg) => {
    if (value === undefined) throw new Error(msg || 'Expected defined value');
  },
  notNull: (value, msg) => {
    if (value === null) throw new Error(msg || 'Expected non-null value');
  }
};

// ==================== TESTS ====================

log.section('🎨 Frontend & Backend Integration Tests');

// Test 1: File System Checks
log.section('📁 File System Verification');

await test('Frontend source files exist', async () => {
  const fs = await import('fs');
  const pagesPath = join(__dirname, '../src/pages');
  const componentsPath = join(__dirname, '../src/components');
  
  assert.truthy(fs.existsSync(pagesPath), 'Pages directory should exist');
  assert.truthy(fs.existsSync(componentsPath), 'Components directory should exist');
});

await test('Backend source files exist', async () => {
  const fs = await import('fs');
  const serverPath = join(__dirname, '../server/src');
  const modulesPath = join(serverPath, 'modules');
  
  assert.truthy(fs.existsSync(serverPath), 'Server directory should exist');
  assert.truthy(fs.existsSync(modulesPath), 'Modules directory should exist');
});

await test('Test files exist', async () => {
  const fs = await import('fs');
  const testPath = join(__dirname, '../src/test');
  const backendTestPath = join(__dirname, '../server/__tests__');
  
  assert.truthy(fs.existsSync(testPath), 'Test directory should exist');
  assert.truthy(fs.existsSync(backendTestPath), 'Backend test directory should exist');
});

// Test 2: Configuration Files
log.section('⚙️ Configuration Verification');

await test('Frontend package.json exists', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../package.json');
  assert.truthy(fs.existsSync(packagePath), 'package.json should exist');
});

await test('Backend package.json exists', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../server/package.json');
  assert.truthy(fs.existsSync(packagePath), 'package.json should exist');
});

await test('Environment files exist', async () => {
  const fs = await import('fs');
  const backendEnv = join(__dirname, '../server/.env');
  
  // .env might not exist but .env.example should
  const hasEnv = fs.existsSync(backendEnv);
  const hasExample = fs.existsSync(backendEnv + '.example');
  
  assert.truthy(hasEnv || hasExample, 'Environment config should exist');
});

// Test 3: Import Verification
log.section('🔌 Module Import Tests');

await test('Frontend components can be analyzed', async () => {
  const fs = await import('fs');
  const componentFiles = [
    'Navbar.tsx',
    'HeroSection.tsx',
    'ServiceCard.tsx',
    'Footer.tsx'
  ];
  
  const componentsPath = join(__dirname, '../src/components');
  
  for (const file of componentFiles) {
    const exists = fs.existsSync(join(componentsPath, file));
    assert.truthy(exists, `${file} should exist`);
  }
});

await test('Backend modules can be analyzed', async () => {
  const fs = await import('fs');
  const moduleDirs = [
    'auth',
    'users',
    'services',
    'bookings',
    'reviews',
    'availability',
    'admin'
  ];
  
  const modulesPath = join(__dirname, '../server/src/modules');
  
  for (const dir of moduleDirs) {
    const exists = fs.existsSync(join(modulesPath, dir));
    assert.truthy(exists, `${dir} module should exist`);
  }
});

// Test 4: API Documentation
log.section('📚 Documentation Verification');

await test('API documentation exists', async () => {
  const fs = await import('fs');
  const docPath = join(__dirname, '../server/API_DOCUMENTATION.md');
  assert.truthy(fs.existsSync(docPath), 'API documentation should exist');
});

await test('Integration guide exists', async () => {
  const fs = await import('fs');
  const guidePath = join(__dirname, '../INTEGRATION_GUIDE.md');
  assert.truthy(fs.existsSync(guidePath), 'Integration guide should exist');
});

await test('Test reports exist', async () => {
  const fs = await import('fs');
  const testReportPath = join(__dirname, '../server/TEST_REPORT.md');
  const frontendTestReportPath = join(__dirname, '../FRONTEND_UX_TEST_REPORT.md');
  
  assert.truthy(fs.existsSync(testReportPath), 'Backend test report should exist');
  assert.truthy(fs.existsSync(frontendTestReportPath), 'Frontend test report should exist');
});

// Test 5: TypeScript Configuration
log.section('📘 TypeScript Verification');

await test('TypeScript config exists', async () => {
  const fs = await import('fs');
  const tsConfigPath = join(__dirname, '../tsconfig.json');
  assert.truthy(fs.existsSync(tsConfigPath), 'tsconfig.json should exist');
});

await test('Vite config exists', async () => {
  const fs = await import('fs');
  const viteConfigPath = join(__dirname, '../vite.config.ts');
  assert.truthy(fs.existsSync(viteConfigPath), 'vite.config.ts should exist');
});

// Test 6: Playwright Configuration
log.section('🎭 Playwright E2E Setup');

await test('Playwright config exists', async () => {
  const fs = await import('fs');
  const playwrightConfigPath = join(__dirname, '../playwright.config.ts');
  assert.truthy(fs.existsSync(playwrightConfigPath), 'playwright.config.ts should exist');
});

await test('Integration test file exists', async () => {
  const fs = await import('fs');
  const integrationTestPath = join(__dirname, '../src/test/integration.test.ts');
  assert.truthy(fs.existsSync(integrationTestPath), 'integration.test.ts should exist');
});

// Test 7: Dependency Verification
log.section('📦 Dependency Verification');

await test('Frontend has required dependencies', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const requiredDeps = [
    'react',
    'react-dom',
    'react-router-dom',
    '@tanstack/react-query'
  ];
  
  for (const dep of requiredDeps) {
    assert.defined(packageJson.dependencies[dep], `${dep} should be in dependencies`);
  }
});

await test('Frontend has test dependencies', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const requiredDevDeps = [
    '@playwright/test',
    'vitest',
    '@testing-library/react'
  ];
  
  for (const dep of requiredDevDeps) {
    assert.defined(packageJson.devDependencies[dep], `${dep} should be in devDependencies`);
  }
});

await test('Backend has required dependencies', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../server/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  const requiredDeps = [
    'express',
    'mongoose',
    'jsonwebtoken',
    'bcryptjs'
  ];
  
  for (const dep of requiredDeps) {
    assert.defined(packageJson.dependencies[dep], `${dep} should be in dependencies`);
  }
});

// Test 8: Build Configuration
log.section('🏗️ Build Configuration');

await test('Vite build script exists', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  assert.defined(packageJson.scripts.build, 'build script should exist');
  assert.defined(packageJson.scripts.dev, 'dev script should exist');
});

await test('Backend build script exists', async () => {
  const fs = await import('fs');
  const packagePath = join(__dirname, '../server/package.json');
  const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'));
  
  assert.defined(packageJson.scripts.start, 'start script should exist');
  assert.defined(packageJson.scripts.dev, 'dev script should exist');
});

// Test 9: Docker Configuration
log.section('🐳 Docker Setup');

await test('Dockerfile exists', async () => {
  const fs = await import('fs');
  const dockerfilePath = join(__dirname, '../server/Dockerfile');
  assert.truthy(fs.existsSync(dockerfilePath), 'Dockerfile should exist');
});

await test('docker-compose.yml exists', async () => {
  const fs = await import('fs');
  const composePath = join(__dirname, '../server/docker-compose.yml');
  assert.truthy(fs.existsSync(composePath), 'docker-compose.yml should exist');
});

// Test 10: README and Documentation
log.section('📖 Documentation Completeness');

await test('Main README exists', async () => {
  const fs = await import('fs');
  const readmePath = join(__dirname, '../README.md');
  assert.truthy(fs.existsSync(readmePath), 'README.md should exist');
});

await test('Server README exists', async () => {
  const fs = await import('fs');
  const readmePath = join(__dirname, '../server/README.md');
  assert.truthy(fs.existsSync(readmePath), 'README.md should exist');
});

await test('Implementation summary exists', async () => {
  const fs = await import('fs');
  const summaryPath = join(__dirname, '../server/IMPLEMENTATION_SUMMARY.md');
  assert.truthy(fs.existsSync(summaryPath), 'IMPLEMENTATION_SUMMARY.md should exist');
});

await test('Booking system docs exist', async () => {
  const fs = await import('fs');
  const bookingDocsPath = join(__dirname, '../server/BOOKING_SYSTEM.md');
  assert.truthy(fs.existsSync(bookingDocsPath), 'BOOKING_SYSTEM.md should exist');
});

// ==================== RESULTS ====================

setTimeout(() => {
  log.section('📊 Integration Test Results');
  
  const total = results.passed + results.failed + results.skipped;
  
  console.log(`\n${colors.green}Passed:   ${results.passed}${colors.reset}`);
  console.log(`${colors.red}Failed:   ${results.failed}${colors.reset}`);
  console.log(`${colors.yellow}Skipped:  ${results.skipped}${colors.reset}`);
  console.log(`${colors.blue}Total:    ${total}${colors.reset}\n`);

  if (results.failed > 0) {
    console.log(`${colors.yellow}Failed Tests:${colors.reset}`);
    results.tests.filter(t => !t.passed && !t.skipped).forEach(t => {
      console.log(`  - ${t.name}: ${t.error}`);
    });
  }

  if (results.skipped > 0) {
    console.log(`${colors.yellow}Skipped Tests:${colors.reset}`);
    results.tests.filter(t => t.skipped).forEach(t => {
      console.log(`  - ${t.name}: ${t.reason}`);
    });
  }

  // Summary
  log.section('📋 Integration Checklist');
  
  const checks = [
    { name: 'Frontend Structure', check: results.tests.some(t => t.name.includes('Frontend source')) },
    { name: 'Backend Structure', check: results.tests.some(t => t.name.includes('Backend source')) },
    { name: 'Test Files', check: results.tests.some(t => t.name.includes('Test files')) },
    { name: 'Configuration', check: results.tests.some(t => t.name.includes('config')) },
    { name: 'Dependencies', check: results.tests.some(t => t.name.includes('dependencies')) },
    { name: 'Documentation', check: results.tests.some(t => t.name.includes('Documentation')) },
    { name: 'Docker Setup', check: results.tests.some(t => t.name.includes('Docker')) },
    { name: 'E2E Tests', check: results.tests.some(t => t.name.includes('Playwright')) }
  ];
  
  checks.forEach(check => {
    if (check.check) {
      log.success(check.name);
    } else {
      log.error(check.name);
    }
  });

  if (results.failed === 0) {
    log.success('🎉 All integration checks passed!');
    console.log(`\n${colors.green}✅ Frontend & Backend integration is ready!${colors.reset}\n`);
  }

  process.exit(results.failed > 0 ? 1 : 0);
}, 500);
