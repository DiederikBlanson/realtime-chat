describe('Send and receive messages', () => {
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

    it('able to send a message', () => {
        cy.fixture('chat').then(({ sender, receiver, message }) => {
            cy.login(sender)

            // Select chat
            cy.contains(receiver).click()

            // Type and send a message
            cy.get('input').type(message)
            cy.get('.chat-field button').click()

            // The message should be displayed as "SEND"
            cy.get('.send-msg').last().should('exist')
        })
    })

    it('able to receive a message', () => {
        cy.fixture('chat').then(({ receiver }) => {
            cy.login(receiver)
            cy.wait(2000)
        })
    })

    it('able to see that someone has received the message', () => {
        cy.fixture('chat').then(({ sender, receiver }) => {
            cy.login(sender)
            cy.select_chat(receiver)

            // You should add a check here to ensure the "received-msg" exists.
            // This check can be added based on how the "received" message is styled in your application.
            // For example, you can check for a specific class or element.
            cy.get('.received-msg').last().should('exist')
        })
    })

    it('able to read a message', () => {
        cy.fixture('chat').then(({ receiver, sender, message }) => {
            cy.login(receiver)
            cy.select_chat(sender)

            // Verify that the message text is present in the chat
            cy.contains(message)

            // Wait for a certain duration to simulate reading
            cy.wait(1000)
        })
    })

    it('able to see that someone has read the message', () => {
        cy.fixture('chat').then(({ receiver, sender }) => {
            cy.login(sender)
            cy.select_chat(receiver)

            // You should add a check here to ensure the "read-msg" exists.
            // This check can be added based on how the "read" message is styled in your application.
            // For example, you can check for a specific class or element.
            cy.get('.read-msg').last().should('exist')
        })
    })
})
