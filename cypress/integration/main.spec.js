/// <reference types="cypress" />

import { PIN_TIMEOUT_SUCCESS } from '../../src/utils/constants';

describe('onboarding', () => {
  it('setup new wallet without backup', () => {
    cy.visit('/');
    cy.get('[data-cy=main-button]').contains('SETUP WALLET').click();
    cy.get('[data-cy=sub-button]').contains('DO IT LATER').click();
    cy.get('[data-cy=pin-input]').children().type('000000');
    cy.wait(PIN_TIMEOUT_SUCCESS);
    cy.get('[data-cy=pin-input]').children().type('000000');
    cy.get('[data-cy=checkbox]').check({ force: true });
    cy.get('[data-cy=main-button]').contains('CONTINUE').click();
    cy.url().should('contain', '/wallet');
    cy.get('[data-cy=main-button]')
      .contains('DEPOSIT ASSETS')
      .should('have.length', 1);
    cy.getLocalStorage('cap_sec_tdex-app-mnemonic')
      .should('be.a', 'string')
      .its('length')
      .should('be.gt', 250)
      .should('be.lt', 350);
  });
});
