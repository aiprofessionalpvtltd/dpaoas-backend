const axios = require('axios')
// const logsQueries = require('../queries/logs.queries')
const logger = require('../common/winston');

const baseUrl = process.env.SENATE_API_URL || `http://api.senate.gov.pk/`
async function makeRequest(
  method,
  url,
  options = {},
  directUrl = false
) {
  const endpoint = directUrl ? url : `${baseUrl}${url}`
  try {
    console.log("endpoint---->>",endpoint)
    //logger.info(`Calling endpoint ${endpoint}`)
    const { data } = await axios({
      method,
      url: endpoint,
      timeout: 1000 * 11, // Wait for 9 seconds
      ...options,
    })
    //console.log("data--->", data)
    //logger.info(`Data fetched successfully from endpoint ${endpoint}`) 
    return data
  } catch (error) {
    logger.error(`Error occurred on endpoint ${endpoint}`)
    logger.error(`Error value: ${error}`)
    const logsPayload = {
      endpoint,
      code: error?.code,
      response: error?.response,
      error_payload: error && JSON.stringify(error),
    }
    // db.execute(logsQueries.INSERT_LOGS, [logsPayload])
    if (error.response && error.response.status) {
      throw { code: error.response.status, message: error.response.statusText }
    }
    if (error.code) {
      throw { code: error.code, message: error.message }
    }
  }
}
exports.makeRequest = makeRequest
