const { defineConfig } = require('@playwright/test');
module.exports = defineConfig({
  testDir: __dirname,
  testMatch: 'regression.spec.cjs',
  timeout: 30000,
  expect: { timeout: 7000 },
  use: { baseURL: 'http://127.0.0.1:4173', viewport: { width: 1280, height: 800 }, screenshot: 'only-on-failure', trace: 'retain-on-failure' },
  webServer: { command: 'npx http-server .. -p 4173 -a 127.0.0.1 -c-1 -s', cwd: __dirname, url: 'http://127.0.0.1:4173', reuseExistingServer: !process.env.CI, timeout: 45000 },
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
});
