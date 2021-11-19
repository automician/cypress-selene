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

// Import commands.js using ES2015 syntax:
import './commands'

// TODO: consider exporting s, be, have instead of making them global

global.browser = cy

import { Locator } from './locator'

global.s = (selector, options={}) => new Locator({
  path: selector,
}, options)

import './conditions'

import { be, have } from './conditions.aliases'
global.be = be
global.have = have

export { 
  Locator 
}
