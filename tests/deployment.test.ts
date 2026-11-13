import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const compose = readFileSync('compose.yaml', 'utf8');
const dockerfile = readFileSync('Dockerfile', 'utf8');
const config = readFileSync('smrt.config.ts', 'utf8');
const ci = readFileSync('.github/workflows/ci.yml', 'utf8');

/** The text of one top-level service block. */
function service(name: string): string {
  const match = compose.match(
    new RegExp(`^  ${name}:\\n((?:    .*\\n|\\n)+)`, 'm'),
  );
  if (!match) throw new Error(`compose.yaml has no ${name} service`);
  return match[1];
}

describe('deployment declaration (x-happyvertical)', () => {
  it('declares contract version 1 with the smrt preset and a migrate command', () => {
    expect(compose).toMatch(
      /^x-happyvertical:\n {2}version: 1\n {2}preset: smrt\n/m,
    );
    expect(compose).toContain(
      'command: ["pnpm", "exec", "smrt", "db:migrate"]',
    );
  });

  it('annotates the web role with its health path', () => {
    const web = service('web');
    expect(web).toMatch(/role: web/);
    expect(web).toMatch(/path: \/api\/_runtime\/health/);
  });

  it('annotates both workers as worker roles with a health command', () => {
    for (const name of ['worker', 'schedule-worker']) {
      const block = service(name);
      expect(block, name).toMatch(/role: worker/);
      expect(block, name).toMatch(
        /health:\n\s+command: \["pnpm", "exec", "smrt", "app", "doctor"\]/,
      );
    }
  });

  it('binds PostgreSQL and leaves the one-shot migration unannotated', () => {
    expect(service('database')).toMatch(/binding: postgres/);
    expect(service('migrate')).not.toMatch(/x-happyvertical/);
  });

  it('ships the default providers the README tells people to replace', () => {
    expect(compose).toContain(
      'SMRT_AUTHENTICATION_PROVIDER: ${SMRT_AUTHENTICATION_PROVIDER:-password}',
    );
    expect(compose).toContain(
      'SMRT_ASSETS_PROVIDER: ${SMRT_ASSETS_PROVIDER:-local-files}',
    );
    expect(compose).toContain(
      'SMRT_SECRETS_PROVIDER: ${SMRT_SECRETS_PROVIDER:-environment}',
    );
    expect(readFileSync('README.md', 'utf8')).toContain(
      'Replace before real use',
    );
  });

  it('keeps the local profile free of container glue', () => {
    expect(config).not.toMatch(/runtime\s*:/);
    expect(dockerfile).toContain('ENV SMRT_RUNTIME_PROFILE=self-hosted');
    expect(dockerfile).toContain('ENV COREPACK_HOME=');
  });

  it('closes the stand-in sign-in route unless password sign-in is selected', () => {
    expect(
      readFileSync('src/routes/auth/password/+server.ts', 'utf8'),
    ).toContain("SMRT_AUTHENTICATION_PROVIDER !== 'password'");
    expect(readFileSync('scripts/provision-owner.mjs', 'utf8')).toContain(
      "SMRT_AUTHENTICATION_PROVIDER !== 'password'",
    );
  });

  it('is checked in CI', () => {
    expect(ci).toContain('pnpm deploy:check');
  });
});
