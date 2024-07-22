module.exports = {
  email: {
    host: process.env.EMAIL_HOST,
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
    port: process.env.EMAIL_PORT,
    supportEmail: process.env.SUPPORT_EMAIL,
    techEmail: process.env.TECH_EMAIL,
  },
}
