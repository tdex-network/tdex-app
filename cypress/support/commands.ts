import 'cypress-localstorage-commands';
import { faucet } from '../../test/test-utils';
import { firstAddress, localStorage, pin } from '../fixtures/fixtures.json';

Cypress.Commands.add('launchWallet', () => {
  cy.then(() => cy.visit('/'))
    .then(() => {
      for (const localStorageKey in localStorage) {
        if (
          Object.prototype.hasOwnProperty.call(localStorage, localStorageKey)
        ) {
          cy.then(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cy.setLocalStorage(localStorageKey, localStorage[localStorageKey]);
          });
        }
      }
    })
    .then(async () => {
      const txid = await faucet(firstAddress, 100);
      console.log('Funding 100 L-BTC to first wallet address');
      console.log(txid);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
    })
    .then(() => {
      cy.get('[data-cy=pin-input]').children().type(pin);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(1000);
    });
});
