// --- CUSTOM CONDITIONS --- // 

const elementsCollectionHaveExactTexts = (_chai, utils) => {
  // this style of implementation should provide proper hints when autocomplete // TODO: make this hint work...
  // if you don't need it, consider the simpler version
  // like in this example: https://stackoverflow.com/a/55854585/1297371

  /*

  // it's also possible to use this alternative implementation
  // (not as Chai assertion, but simply cy callback)

  const haveExactTexts = (...texts) => ($elements) => {
      const actualTexts = $elements.map((i, element) => {
        return Cypress.$(element).text().trim()
      }).get()
    
      expect(actualTexts).to.deep.eq(texts)
  }

  // so then can be used like 

  cy.get('.vowel').should(haveExactTexts('a', 'e', 'i', 'o', 'u'))

  // being pretty simple, 
  // yet this implementation is less powerfull 
  // in context of logging errors on failures

  */

  function assertExactTexts(...texts) {
    const $elements = this._obj
    const expectedTexts = (
      (
        Array.isArray(texts) && texts.length === 1 && Array.isArray(texts[0])
      ) ? 
        texts[0]
        : 
        texts
    ).map((it) => it === undefined ? undefined : it.toString())
    // ).map((it) => it?.toString())

    const actualTexts = $elements.map((i, element) => { 
      return Cypress.$(element).text().trim()
    }).get()

    /* 
    // might also work something like:
    _chai.Assertion(actualTexts).to.deep.eq(texts)
    // or
    _chai.Assertion(actualTexts).to.have.same.members(texts)
    // instead of the following...
    */

    this.assert(
      // expression to be tested
      actualTexts.length === expectedTexts.length 
      && actualTexts.every((actual, i) => actual === expectedTexts[i]),
      // msg or fn to describe failure
      `${$elements.selector} `
      + 'should have exact texts: #{exp}'
      + '\nactual texts: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$elements.selector} `
      + 'should not have exact texts: #{exp}'
      + '\nactual texts: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // expected
      '[' + expectedTexts.join(', ') + ']',
      // actual
      '[' + actualTexts.join(', ') + ']',
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod('exactTexts', assertExactTexts)
}

chai.use(elementsCollectionHaveExactTexts)

const elementsCollectionHaveTexts = (_chai, utils) => {

  function assertTexts(...texts) {
    const $elements = this._obj
    const expectedTexts = (
      (
        Array.isArray(texts) && texts.length === 1 && Array.isArray(texts[0])
      ) ? 
        texts[0]
        : 
        texts
    ).map((it) => it === undefined ? undefined : it.toString())
    // ).map((it) => it?.toString())

    const actualTexts = $elements.map(function() { 
      return Cypress.$(this).text().trim()
    }).get()

    this.assert(
      // expression to be tested
      actualTexts.length === expectedTexts.length 
      && actualTexts.every((actual, i) => actual.includes(expectedTexts[i])),
      // msg or fn to describe failure
      `${$elements.selector} `
      + 'should have texts: #{exp}'
      + '\nactual texts: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$elements.selector} `
      + 'should not have texts: #{exp}'
      + '\nactual texts: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // expected
      '[' + expectedTexts.join(', ') + ']',
      // actual
      '[' + actualTexts.join(', ') + ']', 
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod('texts', assertTexts)
}

chai.use(elementsCollectionHaveTexts)

const elementsCollectionHaveDescendants = (_chai, utils) => {

  function assertDescendants(selector) {
    // TODO: add {visible: boolean} parameter
    const $elements = this._obj
    const actualFoundLength = $elements.has(selector).length

    this.assert(
      // expression to be tested
      actualFoundLength > 0,
      // msg or fn to describe failure
      `${$elements.selector} `
      + 'should have at least 1 element found by #{exp}'
      + '\nactual found elements length: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$elements.selector} `
      + 'should have 0 elmeents found by #{exp}'
      + '\nactual found elements length: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // expected
      selector,
      // actual
      actualFoundLength, 
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod('elements', assertDescendants)
}

chai.use(elementsCollectionHaveDescendants)

const elementsCollectionHaveFiltered = (_chai, utils) => {

  function assertFiltered(selector) {
    // TODO: add {visible: boolean} parameter
    const $elements = this._obj
    const actualFoundLength = $elements.filter(selector).length
    
    this.assert(
      // expression to be tested
      actualFoundLength > 0,
      // msg or fn to describe failure
      `${$elements.selector} `
      + 'should have at least 1 matched element by #{exp}'
      + '\nactual matched elements length: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$elements.selector} `
      + 'should have 0 matched elmeents by #{exp}'
      + '\nactual matched elements length: #{act}'
      + '\nactual colllection:'
      + '\n#{this}'
      ,    
      // expected
      selector,
      // actual
      actualFoundLength, 
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod('filtered', assertFiltered)
}

chai.use(elementsCollectionHaveFiltered)

const elementHaveTextCaseInsensitive = (_chai, utils) => {

  function assertTextCaseInsensitive(text) {
    const $element = this._obj
    const expectedText = text
    const actualText = $element.text().trim()

    this.assert(
      // expression to be tested
      actualText.toLowerCase().includes(
        expectedText.toLowerCase()
      ),
      // msg or fn to describe failure
      `${$element.selector} `
      + 'should have text (case insensitive): #{exp}'
      + '\nactual text: #{act}'
      + '\nactual element:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$element.selector} `
      + 'should not have text (case insensitive): #{exp}'
      + '\nactual text: #{act}'
      + '\nactual element:'
      + '\n#{this}'
      ,    
      // expected
      expectedText,
      // actual
      actualText,
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod('textCaseInsensitive', assertTextCaseInsensitive)
}

chai.use(elementHaveTextCaseInsensitive)

const elementHaveExactTextCaseInsensitive = (_chai, utils) => {

  function assertExactTextCaseInsensitive(text) {
    const $element = this._obj
    const expectedText = text
    const actualText = $element.text().trim()

    this.assert(
      // expression to be tested
      actualText.toLowerCase() === expectedText.toLowerCase(),
      // msg or fn to describe failure
      `${$element.selector} `
      + 'should have text (case insensitive): #{exp}'
      + '\nactual text: #{act}'
      + '\nactual element:'
      + '\n#{this}'
      ,    
      // msg or fn to describe negated failure
      `${$element.selector} `
      + 'should not have text (case insensitive): #{exp}'
      + '\nactual text: #{act}'
      + '\nactual element:'
      + '\n#{this}'
      ,    
      // expected
      expectedText,
      // actual
      actualText,
      // show diff?
      false, 
    )
  }

  _chai.Assertion.addMethod(
    'exactTextCaseInsensitive', 
    assertExactTextCaseInsensitive,
  )
}

chai.use(elementHaveExactTextCaseInsensitive)
