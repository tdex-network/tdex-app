/// <reference types="cypress" />

// ***********************************************************
// This example support/index.js is processed and
// loaded automatically before your test files.
//
// This is a great place to put global configuration and
// behavior that modifies Cypress.
//
// You can change the location of this file or turn off
// automatically serving support files with the
// 'supportFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/configuration
// ***********************************************************

import './commands';
import type { localStorage } from '../fixtures/fixtures.json';

declare global {
  namespace Cypress {
    interface Chainable {
      launchWallet(opts?: Partial<typeof localStorage>): Chainable;
    }
  }
}
