const winston = require('../common/winston')
const axios = require('axios')
const parseString = require('xml2js').parseString
const config = require('../config/phone')
const logger = require('../common/winston');

const clientId = config.phone.clientId
const clientPassword = config.phone.password
const clientUrl = config.phone.baseUrl
const shortCode = config.phone.shortCode
const messageType = config.phone.messageType
const language = 'English'
const baseUrl = `${clientUrl}?id=${clientId}&password=${clientPassword}&groupname=&messagetype=${messageType}&shortcode=${shortCode}&lang=${language}`
exports.sendMessage = async (to, message) => {
  logger.info(`sendMessage to ${to} with message:${message}`)
  if (process.env.CHECK_PHONE_API === 'local') return
  const endpoint = `${baseUrl}&message=${message}&mobilenum=${to}`
  // const endpoint ='https://bsms.ufone.com/bsms_v8_api/sendapi-0.3.jsp?id=03348960423&message=test&shortcode=SENATE&lang=English&mobilenum=923315231242&password=P@kistan123&groupname=&messagetype=Transactional'
  try {
    logger.info(`Calling Message api ${endpoint}`)
    const { data } = await axios({
      method: 'GET',
      url: endpoint,
      timeout: 1000 * 10, // Wait for 10 seconds
    })
    parseString(data, function (err, result) {
      logger.info(`result ${JSON.stringify(result)}`)
      if (result.response_to_browser.response_id[0] === '0') {
        logger.info(`Message send successfully to ${to}`)
      } else {
        logger.error(`Message not send to ${to}`)
        logger.error(
          `Response Text ${result.response_to_browser.response_text[0]}`,
        )
      }
    })
    return data
  } catch (error) {
    logger.error(`Message not send to ${to}`)
    logger.error(`Error occurred on endpoint ${endpoint}`)
    logger.error(`Error value: ${error}`)
  }
}
