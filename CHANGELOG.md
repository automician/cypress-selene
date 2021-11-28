# Changelog
All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]
### Added 
- for new features by [@_author_X_Y_Z_](https://github.com/_author_X_Y_Z_).
### Changed 
- for changes in existing functionality.
### Deprecated 
- for soon-to-be removed features.
### Removed 
- for now removed features.
### Fixed 
- for any bug fixes [#1234](https://github.com/automician/cypress-selene/issues/1234)
### Security 
- in case of vulnerabilities.

## [1.0.0-alpha.4] - 2021-11-28
### Added
- have.textCaseInsensitive, have.exactTextCaseInsensitive

## [1.0.0-alpha.3] - 2021-11-28 (not finished:p)
### Added (partially)
- have.textCaseInsensitive, have.exactTextCaseInsensitive

## [1.0.0-alpha.2] - 2021-11-20
### Added
- locator.first(), locator.last()

## [1.0.0-alpha.1] - 2021-11-19
### Added
- Locator class as Lazy and Fluent API wrapper 
  - over
    - `cy.get(selector)`, 
    - `.filter(selector)`
      - with `.by(selector)` alias, 
        with additional selector conversions 
        see custom commands explanations below;)
    - `.not(selector)`
      with additional selector conversions 
      see custom commands explanations below;)
    - `.find(selector)`
    - `.eq(index)`
    - `.next(selector)`
    - `.should(matcher, *args)`
  - with all methods above 
    - being lazy, returning same Locator instance with "updated" selector path
      - so you can store it in the var, like
        `const active = new Locator({path: '#todo-list>li'}).not('.completed')`
    - being fully retriable (cypress only retries the last command)
      - with integrated smart waits/assertions per retry
        so you see in log what was the reason of retry and its failure in the worst case
        i.e. you can break down long selectors into parts in order to see in the log the exact problematic part
        and so fasten your tests support ;)
  - with non lazy commands, that actually find subject to perform actual actions
    - `locator.get()` returning actual cy subject
      - here the lazyness ends, and all subsequent API is a raw Cypress one, 
        i.e. not lazy, and you can not store it into vars)
      - it's usefull to force it to get raw subject and use classic cy command that is not yet available in Locator.*
    - `locator.type(text)`
    - `locator.clear()`
    - `locator.submit()`
    - `locator.setValue(text)`
      - as alias to `.clear().type(text)`
    - `locator.click()`
    - `locator.doubleClick()`
      - as more user-oriented alias to `.dbclick` 
    - `locator.hover()`
      - as alias to .trigger('mousover')
    - `locator.pressEnter()`
    - `locator.pressEscape()`

- globals 
  - ... planned to be removed from globals in newer versions ;)
  - Selene's style 
    - `browser` as alias to `cy`
      - for more user-oriented `browser.visit('https://url.org')` over `cy.visit('https://url.org')`
    - `s(selector)` as alias to new `Locator({path: selector})`
      - to allow lazy (also with full retriability)
        ```
        const todos = s('#todo-list>li)
        //...
        todos.should(/*...*/)
        todos.filter('.completed').should(/*...*/)
        ```
        over not-fully-retriable and lazy-only-via-functions
        ```
        const todos = () => cy.get('#todo-list>li)
        //...
        todos().should(/*...*/)
        todos().filter('.completed').should(/*...*/) // Cypress retries only .filter(...) here
        ```
    - `be.*` and `have.*` 
      - as aliases to some most used cypress «chainers/matchers/conditions»
      - for cleaner code (when reviewing it will be easier to distinguish code from test data;):
        ```
        s('#todo-list>li').eq(1).should(have.text, 'i am test data, emphasized by quotes;)')
        ```
        over 
        ```
        s('#todo-list>li').eq(2).should('have.text', 'of same style as prev arg')
        ```

- customized commands
  - new
    - `cy.the(wordOrSmarterSelector)` in addition to `cy.get(selector)`
      - to consider all words as values of `data-qa` attributes
        i.e. `cy.the('submit')` is same as `cy.get('[data-qa=submit]')`
        support of customizing such «data qa attributes» will be added later [#2](https://github.com/automician/cypress-selene/issues/2)
      - to support Playwright style «search by text»
        i.e. `cy.the('text=Press me')` is same as `cy.contains('Press me')`
      - same as `cy.get(selector)` otherwise  
      - support of customizing such conversions will be added later [#3](https://github.com/automician/cypress-selene/issues/3)
    - `cy.by(smarterSelector)` as alias to `cy.filter(selector)` 
      - for conciseness
      - and smarter conversions:
        ```
        cy.get('.todo').by(':contains("Write a test!")')
        cy.get('.todo').by('text=Write a test')  // same as above

        cy.get('.todo').by('.completed')  // same as cy.get('.todo').filter('.completed')
        cy.get('.todo').by(':not(.completed)')  // same as cy.get('.todo').not('.completed')

        cy.get('.todo').by(':has(img.high-priority-flag)')  // same as cy.get('.todo').filter(':has(img.high-priority-flag)')
        cy.get('.todo').by(' img.high-priority-flag')  // same as above

        cy.get('.todo').by(':has(>img.high-priority-flag)')
        cy.get('.todo').by('>img.high-priority-flag')  // same as above
        ```
        P.S. `s(selector)` is also available 
        for even conciser: 
        ```
        s('.todo').by('text=Write a test')
        s('.todo').by('.completed')
        ```
  - overwritten 
    - `cy.not` for same conversions as in custom `cy.by`

- customized conditions (matchers)
  - new
    - `have.texts(...partialValues)`
      - for conciser version
        ```
        s('#todo-list li').should(have.texts, 'a', 'c')
        ``` 
        over raw cypress 
        ```
        cy.get('@todo-list li').as('todos')
        //...
        cy.get('@todos').should('have.length', 2)
        cy.get('@todos')
        .eq(0)
        .should('contain', 'a')
  
        cy.get('@todos')
        .eq(1)
        .should('contain', 'c')
        ```
        ... 🤦🏻‍♂️ – check real [official example](https://github.com/cypress-io/cypress-example-todomvc/blob/4e5637b8e00d25d8661c455b2e3c026ee8d8c175/cypress/integration/app_spec.js#L495)
    - `have.exactTexts(...values)`
    - `have.elements(selector)` or `have.the(selector)`
      - as alias to 
        `.should(($elements) => { expect($elements.has(selector).length).to.be.gt(0) })`
    - `have.filtered(selector)`
      - as alias to 
        `.should(($elements) => { expect($elements.filter(selector).length).to.be.gt(0) })`
  - changed in alias (have.* or be.*)
    - for better readability according to native english in `be.*` style
      -  `be.equalTo` over `'equal'` 
      -  `be.matching` over `'match'` 
      -  `be.containing` over `'contain'` 
      -  `have.valueContaining` over `'contain.value'` 
    -  `be.inDOM` over `'exist'` for less confusion in understanding from the user perspective
    - `have.text` over `'include.text'` as in Selenide/Selene, 
      because in native english «have text» naturally means «have some text inside»
    - `have.exactText` over `'have.text'` as in Selenide/Selene, 
    - `have.cssClass` over `'have.class'` as in Selenide/Selene 
      for less confusion, because «class» is also the whole attribute 
      that can contain many «css classes»
