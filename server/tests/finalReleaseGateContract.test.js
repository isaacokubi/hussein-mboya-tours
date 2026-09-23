import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..', '..');

function read(relativePath) {
  return fs.readFileSync(path.join(root, relativePath), 'utf8');
}

function exists(relativePath) {
  return fs.existsSync(path.join(root, relativePath));
}

test('final release contract: required release documentation exists', () => {
  for (const file of [
    'README.md',
    'docs/PRODUCTION_READINESS.md',
    'docs/PRODUCTION_GO_LIVE_CHECKLIST.md',
    'docs/STEP3_PRODUCTION_RELEASE_RUNBOOK.md',
    'docs/STORED_TEST_EXECUTION_QUEUE.md',
    'docs/EXTERNAL_WEBSITE_CONNECTOR.md',
    'docs/COMMERCIAL_READINESS_IMPLEMENTATION_STATUS.md',
  ]) {
    assert.equal(exists(file), true, file);
  }
});

test('final release contract: environment templates do not contain real secret patterns', () => {
  const files = ['client/.env.example', 'server/.env.example'];
  const secretPatterns = [
    /sk_live_[A-Za-z0-9]+/,
    /AKIA[0-9A-Z]{16}/,
    /-----BEGIN (RSA |EC |OPENSSH )?PRIVATE KEY-----/,
    /ghp_[A-Za-z0-9]{20,}/,
  ];

  for (const file of files) {
    const content = read(file);
    for (const pattern of secretPatterns) {
      assert.equal(pattern.test(content), false, file + ' matched ' + pattern);
    }
  }
});

test('final release contract: client env template exposes public configuration only', () => {
  const content = read('client/.env.example');
  assert.match(content, /VITE_API_URL=/);
  assert.match(content, /VITE_SOCKET_URL=/);
  assert.match(content, /VITE_PLATFORM_MODE=/);
  assert.match(content, /VITE_PUBLIC_TENANT_SLUG=/);
  assert.doesNotMatch(content, /VITE_.*(SECRET|PASSWORD|PRIVATE_KEY|TOKEN)=.+/i);
});

test('final release contract: server env template keeps production fallbacks disabled', () => {
  const content = read('server/.env.example');
  assert.match(content, /ALLOW_SINGLE_TENANT_DEV_FALLBACK=false/);
  assert.match(content, /ALLOW_GLOBAL_MPESA_FALLBACK=false/);
  assert.match(content, /MFA_DEV_MODE=false/);
  assert.match(content, /MPESA_ENVIRONMENT=production/);
});

test('final release contract: server exposes the required release checks', () => {
  const pkg = JSON.parse(read('server/package.json'));
  for (const script of [
    'check:all',
    'check:production',
    'check:security',
    'check:tenant-models',
    'check:multitenancy:live',
    'test',
    'test:security',
    'test:tour-domain',
  ]) {
    assert.equal(typeof pkg.scripts?.[script], 'string', 'missing script: ' + script);
  }
});

test('final release contract: Vercel config is frontend-only and has no secret-bearing build env', () => {
  const config = JSON.parse(read('vercel.json'));
  assert.equal(config.framework, 'vite');
  assert.equal(config.outputDirectory, 'client/dist');
  assert.equal(config.buildCommand, 'cd client && npm install && npm run build');
  assert.equal(config.installCommand, 'cd client && npm install');
  assert.equal('env' in config, false);
});

test('final release contract: release gate runs the final contract before client build', () => {
  const workflow = read('.github/workflows/release-gate.yml');
  assert.match(workflow, /name: Three-Phase Release Gate/);
  assert.match(workflow, /name: Phase 3 — Final release gate/);
  assert.match(workflow, /node --test tests\/finalReleaseGateContract\.test\.js/);
  assert.match(workflow, /npm run lint/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /Verify no committed environment secrets/);
});

test('final release contract: go-live evidence is explicitly external', () => {
  const checklist = read('docs/PRODUCTION_GO_LIVE_CHECKLIST.md');
  for (const marker of [
    'PRODUCTION_PAYMENT_VERIFIED=true',
    'PRODUCTION_ETIMS_VERIFIED=true',
    'PRODUCTION_WEBHOOKS_VERIFIED=true',
    'PRODUCTION_BACKUP_VERIFIED=true',
    'PRODUCTION_RESTORE_TESTED=true',
    'PRODUCTION_MONITORING_VERIFIED=true',
  ]) {
    assert.ok(checklist.includes(marker), 'missing evidence marker: ' + marker);
  }
  assert.match(checklist, /Do not mark an evidence flag true unless the corresponding external test was actually completed/);
});
