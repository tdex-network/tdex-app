// @ts-ignore
describe('empty spec', () => {
  before(() => {
    console.log('before');
  });

  it('passes', () => {
    cy.visit('https://example.cypress.io');
  });
});
