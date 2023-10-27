describe('template spec', () => {
    it('able to connect to the websocket server', () => {
        cy.fixture('chat').then(({ sender }) => {
            cy.login(sender)
            cy.get('#header button').eq(1).click()
            cy.get('.MuiDialog-container').contains('WebSocket: localhost')
        })
    })

    it('able to see contacts', () => {
        cy.fixture('chat').then(({ sender }) => {
            cy.login(sender)
            cy.get('#contacts .MuiListItem-gutters').should('have.length', 4)
        })
    })

    it('able to send a chat', () => {
        cy.fixture('chat').then(({ sender, receiver, message }) => {
            cy.login(sender)
            cy.contains(receiver).click()

            cy.get('input').type(message)
            cy.get('.chat-field button').click()
            cy.get('.send-msg').last().should('exist')

            cy.get('#chat-messages .MuiBox-root')
                .its('length')
                .then((newLength) => {
                    cy.wrap(newLength).should('eq', 1)
                })
        })
    })

    it('able to receive a chat', () => {
        cy.fixture('chat').then(({ receiver }) => {
            cy.login(receiver)
            cy.wait(2000)
        })
    })

    it('able to see that someone has received it', () => {
        cy.fixture('chat').then(({ sender, receiver }) => {
            cy.login(sender)
            cy.select_chat(receiver)

            cy.get('.received-msg').last().should('exist')
        })
    })

    it('able to read a chat', () => {
        cy.fixture('chat').then(({ receiver, sender, message }) => {
            cy.login(receiver)
            cy.select_chat(sender)

            cy.contains(message)
            cy.wait(1000)
        })
    })

    it('able to see that someone has read it', () => {
        cy.fixture('chat').then(({ receiver, sender }) => {
            cy.login(sender)
            cy.select_chat(receiver)

            cy.get('.read-msg').last().should('exist')
        })
    })
})
