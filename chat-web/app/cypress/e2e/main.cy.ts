describe('template spec', () => {
    it('able to connect to the websocket server', () => {
        cy.login('rafa')
        cy.get('#header button').eq(1).click()
        cy.get('.MuiDialog-container').contains('WebSocket: localhost')
    })

    it('able to see contacts', () => {
        cy.login('rafa')
        cy.get('#contacts .MuiListItem-gutters').should('have.length', 4)
    })

    it('able to send a chat', () => {
        cy.login('rafa')
        cy.contains('roger').click()

        cy.get('#chat-messages .MuiBox-root')
            .its('length')
            .then((length) => {
                cy.get('input').type('Hey Roger! What is going on?')
                cy.get('.chat-field button').click()

                cy.get('#chat-messages .MuiBox-root')
                    .its('length')
                    .then((newLength) => {
                        cy.wrap(newLength).should('eq', length + 1)
                    })
            })
    })

    it('able to receive a chat', () => {
        cy.login('roger')
        cy.contains('rafa').click()

        cy.contains('Hey Roger! What is going on?').should('exist')
        cy.wait(1000)
    })

    it('able to receive a chat', () => {
        cy.login('rafa')
        cy.contains('roger').click()

        cy.get('.read-msg').last().should('exist')
    })
})
