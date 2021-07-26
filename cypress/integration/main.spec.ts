/// <reference types="cypress" />

import { pin } from '../fixtures/fixtures.json';

describe('onboarding', () => {
  it('setup new wallet without backup', () => {
    cy.visit('/');
    cy.get('[data-cy=main-button]').contains('SETUP WALLET').click();
    cy.get('[data-cy=sub-button]').contains('DO IT LATER').click();
    cy.get('[data-cy=pin-input]').children().type('000000');
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
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

describe('trade', () => {
  it('make a trade', () => {
    cy.launchWallet();
    cy.get('[data-cy=tab-exchange]').click();
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(3000);
    cy.get('[data-cy=exchange-send-input]').children().type('1');
    cy.get('[data-cy=exchange-confirm-btn]').contains('CONFIRM').click();
    cy.get('[data-cy=description-p]').should(
      'contain',
      'Enter your secret PIN to send 1 L-BTC and receive',
    );
    cy.get('[data-cy=pin-input]').children().type(pin);
    // eslint-disable-next-line cypress/no-unnecessary-waiting
    cy.wait(1000);
    cy.get('[data-cy=header-title]').should('contain.text', 'TRADE SUMMARY');
    cy.get('[data-cy=trade-summary-sent-amount]').should('contain.text', '-1');
    cy.get('[data-cy=trade-summary-btn]')
      .contains('GO TO TRADE HISTORY')
      .click();
    cy.get('[data-cy=header-title]').should('contain.text', 'TRADE HISTORY');
  });
});
