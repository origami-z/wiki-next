import { existsSync } from 'fs';
import { resolve } from 'path';
import { readFileSync } from 'fs';

describe('Middleware File Location', () => {
  test('middleware should be located at src/middleware.ts', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    expect(existsSync(middlewarePath)).toBe(true);
  });

  test('middleware should NOT be in project root', () => {
    const rootMiddlewarePath = resolve(process.cwd(), 'middleware.ts');
    expect(existsSync(rootMiddlewarePath)).toBe(false);
  });

  test('middleware file should have default export', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Check for default export
    expect(content).toMatch(/export\s+default/);
  });

  test('middleware should have config export with matcher', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Check for config export
    expect(content).toMatch(/export\s+const\s+config/);
    expect(content).toMatch(/matcher/);
  });

  test('middleware matcher should include root path handling', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Should have a matcher that handles root path
    const hasRootMatcher = content.includes('matcher') &&
      (content.includes("'/'") || content.includes('"/\"') || content.includes('(?!'));

    expect(hasRootMatcher).toBe(true);
  });

  test('middleware matcher should exclude _next and api paths', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Should have exclusion patterns for _next and api
    expect(content).toMatch(/api|_next|_vercel/);
  });

  test('middleware should use next-intl', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Should import from next-intl
    expect(content).toMatch(/from\s+['"]next-intl/);
  });

  test('middleware should import routing configuration', () => {
    const middlewarePath = resolve(process.cwd(), 'src/middleware.ts');
    const content = readFileSync(middlewarePath, 'utf-8');

    // Should import routing from i18n
    expect(content).toMatch(/from\s+['"]\.\/i18n\/routing['"]/);
  });
});
