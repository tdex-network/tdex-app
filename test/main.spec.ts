import { expect, test } from '@playwright/test';

import faucet from '../test/faucet';
import markets from '../test/fixtures/trade.integration.json';

import fixtures from './fixtures/fixtures.json';

test.beforeAll(async () => {
  faucet(fixtures.firstAddress, 100, '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225').catch(
    console.error
  );
});

test.describe('onboarding', () => {
  test('setup new wallet without backup', async ({ page, context }) => {
    await page.goto('/');
    await page.getByText(/SETUP WALLET/).click();
    await page.getByText(/DO IT LATER/).click();
    await page.locator('input[name=pin-input]').fill('000000');
    await expect(page.getByTestId('description-title')).toHaveText('Repeat PIN');
    await page.locator('input[name=pin-input]').fill('000000');
    await page.getByRole('checkbox', { name: /I agree/ }).check({ force: true, position: { x: 0, y: 0 } });
    await page.getByText(/CONTINUE/).click();
    await expect(page).toHaveURL(/wallet/);
    await expect(page.getByText(/RECEIVE ASSETS/)).toHaveCount(1);
    const localStorage = await page.evaluate(() => window.localStorage);
    expect(Boolean(JSON.parse(localStorage['CapacitorStorage.tdex-app-mnemonic']).data)).toBeTruthy();
  });
});

test.describe('onboarded', () => {
  test.use({
    storageState: {
      cookies: [],
      origins: [
        {
          origin: 'http://localhost:8100',
          localStorage: [
            { name: 'CapacitorStorage.tdex-app-transactions', value: '[]' },
            { name: 'CapacitorStorage.theme', value: 'dark' },
            { name: 'CapacitorStorage.tdex-app-utxos', value: '[]' },
            { name: 'CapacitorStorage.tdex-app-lbtc-unit', value: 'L-BTC' },
            {
              name: 'CapacitorStorage.tdex-app-mnemonic',
              value:
                '{"data":"NLWqbzZdRp8RDYCe3sPcNEGLhXWbu+diRUexu84VsYTRShuoqtesUCLjIzpRNiQEhvcPDHkm5NX1/aoRxFHX3LlkXsmJ9EG2POIrgft5y+JJQ/D9ZH+Q9/m+MbAEzg1V","options":{"N":16384,"r":8,"p":1,"klen":32,"salt":"fupF3cfuSMDxNKEpJWYQvVuH5MCbgCt3"}}',
            },
            {
              name: 'CapacitorStorage.tdex-app-currency',
              value: '{"name":"Euro","symbol":"€","value":"eur"}',
            },
            { name: 'CapacitorStorage.tdex-app-pegins', value: '{}' },
            {
              name: 'CapacitorStorage.tdex-app-providers',
              value: '[{"name":"Default provider","endpoint":"http://localhost:9945"}]',
            },
          ],
        },
      ],
    },
  });
  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.locator('input[name=pin-input]').fill(fixtures.pin);
  });

  test.describe('trade', () => {
    test('make a trade', async ({ page }) => {
      await page.getByTestId('tab-exchange').click();
      await expect(page).toHaveURL(/exchange/);
      await page.waitForTimeout(2000);
      await page.fill('input[name=exchange-send-input]', '1');
      await page.getByRole('button', { name: /CONFIRM/ }).click();
      await expect(page.getByTestId('description-p')).toHaveText(/Enter your secret PIN to send 1 L-BTC and receive/);
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      await expect(page).toHaveURL(/tradesummary/, { timeout: 10_000 });
      const tradeSummaryPage = page.locator('#trade-summary');
      await expect(tradeSummaryPage.getByTestId('header-title')).toHaveText(/TRADE SUMMARY/);
      await expect(page.getByTestId('trade-summary-sent-amount')).toHaveText(/-1/);
    });

    test('make a trade in L-sats', async ({ page }) => {
      await page.getByTestId('tab-settings').click();
      await page.locator('span', { hasText: 'L-BTC unit' }).click();
      await page.locator('p', { hasText: 'L-sats' }).click();
      await page.getByTestId('tab-exchange').click();
      await expect(page).toHaveURL(/exchange/);
      await page.locator('input[name=exchange-send-input]').fill('1000');
      await page.getByRole('button', { name: /CONFIRM/ }).click();
      await expect(page.getByTestId('description-p')).toHaveText(
        /Enter your secret PIN to send 1000 L-sats and receive/
      );
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      const tradeSummaryPage = page.locator('#trade-summary');
      await expect(tradeSummaryPage.getByTestId('header-title')).toHaveText(/TRADE SUMMARY/);
      await expect(page.getByTestId('trade-summary-sent-amount')).toHaveText(/-1000/);
    });
  });

  test.describe('withdraw', () => {
    test('withdraw all L-BTC', async ({ page }) => {
      faucet(fixtures.firstAddress, 10);
      await page.getByTestId('item-asset-L-BTC').click();
      await page.getByTestId('button-send').click();
      await page.getByTestId('button-send-max').click();
      await page.locator('input[name=input-addr-withdraw]').fill(fixtures.randomAddress);
      await page.getByText(/CONFIRM/).click();
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      const transactionDetailsPage = page.locator('#transaction-details');
      await expect(transactionDetailsPage.getByTestId('header-title')).toHaveText(/SEND DETAILS/);
    });

    test('withdraw 1 L-BTC', async ({ page }) => {
      faucet(fixtures.firstAddress, 10);
      await page.getByTestId('item-asset-L-BTC').click();
      await page.getByTestId('button-send').click();
      await page.locator('input[name=input-withdraw-amount]').fill('1');
      await page.locator('input[name=input-addr-withdraw]').fill(fixtures.randomAddress);
      await page.getByText(/CONFIRM/).click();
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      const transactionDetailsPage = page.locator('#transaction-details');
      await expect(transactionDetailsPage.getByTestId('header-title')).toHaveText(/SEND DETAILS/);
    });

    test.skip('withdraw all USDt', async ({ page }) => {
      faucet(fixtures.firstAddress, 100, markets[0].market.quoteAsset);
      await page.getByTestId('item-asset-USDt').click();
      await page.getByTestId('button-send').click();
      await page.getByTestId('button-send-max').click();
      await page.locator('input[name=input-addr-withdraw]').fill(fixtures.randomAddress);
      await page.getByTestId('main-button').click();
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      const transactionDetailsPage = page.locator('#transaction-details');
      await expect(transactionDetailsPage.getByTestId('header-title')).toHaveText(/SEND DETAILS/);
    });

    test.skip('withdraw 10 USDt', async ({ page }) => {
      faucet(fixtures.firstAddress, 100, markets[0].market.quoteAsset);
      await page.getByTestId('item-asset-USDt').click();
      await page.getByTestId('button-send').click();
      await page.locator('input[name=input-withdraw-amount]').fill('10');
      await page.locator('input[name=input-addr-withdraw]').fill(fixtures.randomAddress);
      await page.getByTestId('main-button').click();
      await page.locator('input[name=pin-input]').fill(fixtures.pin);
      const transactionDetailsPage = page.locator('#transaction-details');
      await expect(transactionDetailsPage.getByTestId('header-title')).toHaveText(/SEND DETAILS/);
    });
  });
});
