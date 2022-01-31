import 'cypress-localstorage-commands';
import { faucet } from '../../test/test-utils';
import { localStorage as localStorageFixture, pin } from '../fixtures/fixtures.json';

Cypress.Commands.add('launchWallet', (opts?: Partial<typeof localStorageFixture>) => {
  cy.then(() => {
    const localStorage = { ...localStorageFixture, ...opts };
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
      cy.get('[data-cy=pin-input]').children().type(pin);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(15_000);
    });
});

Cypress.Commands.add(
  'faucet',
  (address, amount, asset = '5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225') => {
    cy.then(() => {
      faucet(address, amount, asset).catch(console.error);
    }).then(() => {
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(15_000);
    });
  }
);
