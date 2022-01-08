describe('locator.by(selector)', () => {
  it('by/filter allows to assert 0-length collection', () => {
    browser.visit('https://todomvc.com/examples/emberjs/')

    browser.visit('https://todomvc.com/examples/emberjs/')

    s('#new-todo').type('a').pressEnter()
    s('#new-todo').type('b').pressEnter()
    s('#new-todo').type('c').pressEnter()

    s('#todo-list>li').by('.completed').should(have.length, 0)
    s('#todo-list>li').by('.completed').should(have.exactTexts, [])
  })
})
