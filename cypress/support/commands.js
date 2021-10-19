// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

Cypress.Commands.add(
  'setValue', 
  { prevSubject: 'element'}, 
  (subject, value) => { 
    cy.get(subject).clear().type(value)
  }
)

Cypress.Commands.add(
  'pressEnter', 
  { prevSubject: 'element'}, 
  (subject, value) => { 
    cy.get(subject).type('{enter}')
  }
)

Cypress.Commands.add('by', (selector, ...args) => {

  const isWordWithDashesUnderscoresOrNumbers = (selector) => {
    return /^[a-zA-Z_0-9\-]+$/g.test(selector)
  }

  if (selector.startsWith('text=')) {
    return cy.contains(selector.substring(5))
  } else if (isWordWithDashesUnderscoresOrNumbers(selector)) {
    return cy.get(`[data-qa=${selector}]`, ...args)
  } else {
    return cy.get(selector)
  }
})