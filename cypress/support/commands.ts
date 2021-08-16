import 'cypress-localstorage-commands';
import { localStorage as localStorageFixture, pin } from '../fixtures/fixtures.json';

Cypress.Commands.add('launchWallet', (opts?: Partial<typeof localStorageFixture>) => {
  cy.then(() => cy.visit('/'))
    .then(() => {
      const localStorage = { ...localStorageFixture, ...opts };
      for (const localStorageKey in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, localStorageKey)) {
          cy.then(() => {
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            // @ts-ignore
            cy.setLocalStorage(localStorageKey, localStorage[localStorageKey]);
          });
        }
      }
    })
    .then(() => {
      cy.get('[data-cy=pin-input]').children().type(pin);
      // eslint-disable-next-line cypress/no-unnecessary-waiting
      cy.wait(12_000);
    })
    .then(() => {
      cy.window().then((win) => {
        cy.wrap(cy.spy(win.console, 'error')).as('spyWinConsoleError');
      });
    });
});
