describe('conditions', () => {
  it('allow to assert text and exact text case insensitive', () => {
    browser.visit('https://the-internet.herokuapp.com/')

    s('#content h2')
      .should(have.exactTextCaseInsensitive, 'available examples')
      .should(have.no.exactTextCaseInsensitive, 'not available examples')
      .should(have.textCaseInsensitive, 'available')
      .should(have.no.textCaseInsensitive, 'not available')
      .then(($h2) => {
        try {
          expect($h2).to.have.exactTextCaseInsensitive('not available examples')
          throw 'previous should fail'
        } catch (error) {
          expect(error.message).to.contain(
            "actual text: 'Available Examples'"
          )
        }

        try {
          expect($h2).to.have.textCaseInsensitive('not available examples')
          throw 'previous should fail'
        } catch (error) {
          expect(error.message).to.contain(
            "actual text: 'Available Examples'"
          )
        }
      })
  })
})
