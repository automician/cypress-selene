/// <reference types='cypress' />

import { Locator } from "./locator";
import  * as alias from "./conditions.aliases"

declare global {

  /**
   * user-oriented alias to `cy`
   */
  const browser: Cypress.cy

  /**
   * object-oriented alias to string-oriented `'be.*'` Cypress chainers (matchers)
   */
  const be: typeof alias.be

  /**
   * object-oriented alias to string-oriented `'have.*'` Cypress chainers (matchers)
   */
  const have: typeof alias.have


  /**
    * Gives a Lazy alternative to cy.get(selector)
    * @param selector = a string with css selector
    * @example
    * s('#foo').get().setValue('bar')
    * # over
    * # cy.get('#foo').setValue('bar')
    */
  function s(selector: string): Locator

}
