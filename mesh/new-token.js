const jwt = require('jsonwebtoken')

const secretKey = 'my-secret-key'

const payload = {
  userId: 123,
  username: 'exampleUser',
  role: 'admin'
}

const token = jwt.sign(payload, secretKey, { expiresIn: '10y' })

console.log('Generated Token:', token)
