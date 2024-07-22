module.exports = {
  phone: {
    clientId: process.env.PHONE_MSISDN || '03348960423',
    password: process.env.PHONE_PASSWORD || 'Uf0neAp1P@ss',
    baseUrl:
      process.env.PHONE_API_BASE_URL ||
      'https://bsms.ufone.com/bsms_v8_api/sendapi-0.3.jsp',
    messageType: 'Transactional', // Nontransactional
    shortCode: 'SENATE',
  },
}
