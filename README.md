## Summary

This library is a bunch of cypress extensions for writing more «user-oriented» and «easier to use» High-Level System End-to-End tests. It often uses ideas of the Selenides family of Web UI Testing Frameworks (like [Selenide](https://selenide.org) in Java, [Selene](https://github.com/yashaka/selene/) in Python, [NSelene](https://github.com/yashaka/NSelene/) in C#, [SelenideJs](https://github.com/KnowledgeExpert/selenidejs) in JavaScript).

See [changelog](https://github.com/automician/cypress-selene/blob/main/CHANGELOG.md) for detailed feature break down;)

## Table of contents

- [Summary](#summary)
- [Table of contents](#table-of-contents)
- [Why is it needed?](#why-is-it-needed)
  - [Quick example](#quick-example)
- [Intallation](#intallation)
- [Disclaimer](#disclaimer)
- [Main features breakdown](#main-features-breakdown)
- [Differences from other testing libraries](#differences-from-other-testing-libraries)
  - [Differences from raw Cypress](#differences-from-raw-cypress)
  - [Differences from Selenide & Co](#differences-from-selenide--co)
  - [Differences from Playwright and other async libs for web ui test automation](#differences-from-playwright-and-other-async-libs-for-web-ui-test-automation)

## Why is it needed?

Because raw Cypress:
- lacks important "colellection conditions" aka "matcher for collections"
- retries only the last command, that leads to longer selectors, that can't be break down for faster support on failure (you can't figure out from the log which exact part of long selector had a problem)
- is not lazy, leading to different hacks and workarounds for DRYing the code. 

### Quick example

So, you get this:

```javascript

const newTodo = s('#new-todo')
const todos = s('#todo-list>li')
const completed = todos.by('.completed')
const active = todos.not('.completed')
const complete = (todo) => {
  todos.by(`:contains(${todo})`).find('.toggle').click()
}

// ...

it('completes todo', () => {
  browser.visit('https://todomvc.com/examples/emberjs/')

  newTodo.type('a').pressEnter()
  newTodo.type('b').pressEnter()
  newTodo.type('c').pressEnter()
  todos.should(have.exactTexts, 'a', 'b', 'c')

  complete('b')
  completed.should(have.exactTexts, 'b')
  active.should(have.exactTexts, 'a', 'c')
})
```

Instead of this:

```javascript

const todosSelector = '#todo-list>li'
const newTodo = () => cy.get('#new-todo')
const todos = () => cy.get(todosSelector)
const completed = () => todos().filter('.completed')
const active = () => todos().not('.completed')
const complete = (todo) => {
  todos(`${todosSelector}:contains(${todo}) .toggle`).click()
}

it('completes todo', () => {
  cy.visit('https://todomvc.com/examples/emberjs/')

  newTodo().type('a{enter}')
  newTodo().type('b{enter}')
  newTodo().type('c{enter}')
  todos().should('have.length', 3)
  todos().eq(0).should('have.text', 'a')
  todos().eq(1).should('have.text', 'b')
  todos().eq(2).should('have.text', 'c')

  complete('b')
  completed().should('have.length', 1)
  completed().eq(0).should('have.text', 'b')
  active().should('have.length', 2)
  active().eq(0).should('have.text', 'a')
  active().eq(1).should('have.text', 'c')
}
```

Notice that we had to use longer, not broken down selector with additional variable interpolation:

```javascript
  todos(`${todosSelector}:contains(${todo}) .toggle`).click()
```


This is because in Cypress, the broken down version:

```javascript
const complete = (todo) => {
  todos().filter(`:contains(${todo})`).find('.toggle').click()
}
```

is not the same as in the «cypress-selene» version:

```javascript
const complete = (todo) => {
  todos.by(`:contains(${todo})`).find('.toggle').click()
}
```

Because Cypress will not retry the all chain and ensure proper waiting. 

Hence, such code is useless:
```javascript
todos().filter(`:contains(${todo})`).find('.toggle').click()
```

Moreover, it leads to fragile tests.

We can improve it, though, coming to something like the following:

```javascript
const complete = (todo) => {
  const containsTodo = `:contains(${todo})`
  const toggle = '.toggle'
  const haveFiltered = (selector) => ($elements) => {
    expect($elements.filter(selector).length).to.be.at.least(1)
  }
  todos()
    // needed for better debug: 
    // to separate error when we have no b from have no .toggle inside
    .should(haveFiltered(containsTodo)) 
    // needed for complete stability 
    // (see https://docs.cypress.io/guides/core-concepts/retry-ability#Alternate-commands-and-assertions)
    .should(haveFiltered(`${containsTodo}:has(${toggle})`))
    .filter(containsTodo)
    .find(toggle)
    .click()
}
```

yet, a lot with additional assertions and variables! And all this – is already built into «cypress-selene» version:

```javascript
const complete = (todo) => {
  todos.by(`:contains(${todo})`).find('.toggle').click()
}
```

See more examples at [integration/examples/todomvc.spec.js](https://github.com/automician/cypress-selene/blob/main/cypress/integration/examples/todomvc.spec.js) and [integration/examples/demoqa/studentRegistrationForm.spec.js](https://github.com/automician/cypress-selene/blob/main/cypress/integration/examples/demoqa/studentRegistrationForm.spec.js)

## Intallation

```bash
npm install -D cypress-selene
```

Then include in your project's `cypress/support/index.js`

```javascript
require('cypress-selene')
```

or

```javascript
import 'cypress-selene'
```

## Disclaimer

The smarter retriability magic added to Cypress as a part of this package will make tests more stable but also slower. Though, some configuration will be added later – to tune "magic to your needs", and turn it off when you don't need it ;) (stay tuned and watch [#5](https://github.com/automician/cypress-selene/issues/5))

## Main features breakdown

- Selene/Selenide's style elements `s(selector)` returning the object of Locator class
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

## Differences from other testing libraries

### Differences from raw Cypress

* you can store locators to vars like `const ok = s('#ok')
  * all retry-able queries  (like filter, find, etc.) written in a chain before first action – are retried (in raw Cypress only the last query is retried)
    * yet first action (e.g. type, click) on query (built as a chain of get filter find, etc) potentially break retry-ability for next actions
      * so remember and count that full retry-ability will work only for the first action
      * TODO: consider removing this limitation by implementing: store a chain of commands and call it only ON next cy.get or cy.request (etc.) OR custom cy.end()... or find another way:)
* you can write `.should(have.length, 3)` instead `.should('have.length', 3)`

### Differences from Selenide & Co

* `cy.get(selector)` or this project extension `s(selector)` – is not an element but a Locator that can resolve under the hood into element or collection depending on context. There is no explicit way to differentiate a "collection of elements" and "element".
* $ in Selenide from Java is not the same as $ here, where it's a method from JQuery lib, that allows similar things but on a lower level of DOM manipulation. Instead of Selenide's `$(selector)` – use `s(selector)` here, same way as in Selene from Python ;) – yet, count that it's not a lazy element, it's lazy Locator that can find more than one element;)

### Differences from Playwright and other async libs for web ui test automation

* `cy.*.*.*` is kind of actions builder, that, being async under the hood – looks like syncronous and should be used like syncronous
  * e.g. playwright or webdriver.io - are async and should be used as async ;)
