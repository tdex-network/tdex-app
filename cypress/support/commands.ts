import 'cypress-localstorage-commands';
import * as testUtils from '../../test/test-utils';
import fixtures from '../fixtures/fixtures.json';

function launchWallet(opts?: Partial<typeof fixtures.localStorage>): any {
  cy.then(() => {
    const localStorage = { ...fixtures.localStorage, ...opts };
    for (const localStorageKey in localStorage) {
      if (Object.prototype.hasOwnProperty.call(localStorage, localStorageKey)) {
        cy.then(() => {
          // @ts-ignore
          cy.setLocalStorage(localStorageKey, localStorage[localStorageKey]);
        });
      }
    }
  })
    .then(() =>
      cy.visit('/', {
        onBeforeLoad(win) {
          cy.stub(win.console, `error`, (msg: any) => {
            // @ts-ignore
            cy.now('task', 'error', msg);
          });
        },
      })
    )
    .then(() => {
      cy.get('[data-cy=pin-input]').children().type(fixtures.pin);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(12_000);
    });
}
Cypress.Commands.add('launchWallet', launchWallet as any);

function faucet(
  address: string,
  amount: number | undefined,
  asset = '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225'
) {
  cy.then(() => {
    testUtils.faucet(address, amount, asset).catch(console.error);
  }).then(() => {
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(15_000);
  });
}
Cypress.Commands.add('faucet', faucet as any);
