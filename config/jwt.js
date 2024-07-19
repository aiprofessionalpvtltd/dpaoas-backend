module.exports = {
  jwt: {
    secretKey: process.env.JWT_SECRET_KEY || 'WOWOOWO',
    expiration: process.env.JWT_EXPIRATION || '100y',
  },
}
