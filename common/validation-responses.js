/** function will return res with status 400 and success false
 * @param  {} res //response
 */
const validationErrorResponse = (res, errors) => {
  return res.status(400).send({
    success: false,
    message: 'Required fields are missing',
    errors,
  })
}
/** function will return res with status 404 for specific id and success false
 * @param  {} res //response
 * @param  {} id //specific id which is not found
 * @param  {} name //controller Name
 */
const notFoundResponse = (res, id, name) => {
  return res.status(404).send({
    success: false,
    message: `${name} not found for provided id: ${id}`,
  })
}

/** function will return res with status 409 and success false
 * @param  {} res //response
 * @param  {} message //dynamic message to send in response
 */
const conflictResponse = (res, message) => {
  return res.status(409).send({
    success: false,
    message,
  })
}

/** function will return res with status 401 and success false
 * @param  {} res //response
 */
const unAuthorizedResponse = (res) => {
  return res.status(401).send({
    success: false,
    message: 'User is not Authorized',
  })
}

/** function will return valid response
 * @param  {} res //response
 * @param  {} status //status
 * @param  {} message //message
 * @param  {} data //data
 */
const validResponse = (res, status, message, data) => {
  return res.status(status).send({
    success: true,
    message,
    data,
  })
}
/** function will return error response
 * @param  {} res //response
 * @param  {} error //error
 * @param  {} errorCode //errorCode Optional
 * @param  {} message //message Optional
 */
const errorResponse = (
  res,
  error,
  errorCode = 500,
  message = 'Something went wrong',
) => {
  return res.status(errorCode).send({
    success: false,
    message,
    data: [],
    error,
  })
}

module.exports = {
  validationErrorResponse,
  notFoundResponse,
  conflictResponse,
  unAuthorizedResponse,
  validResponse,
  errorResponse,
}
