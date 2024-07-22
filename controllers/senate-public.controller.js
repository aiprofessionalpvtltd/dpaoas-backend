const { validationResult } = require('express-validator')
const SenatorPublicService = require('../services/senate-public.services')
const {
  validationErrorResponse,
  validResponse,
  errorResponse,
} = require('../common/validation-responses')
const logger = require('../common/winston');
const SenatorPublicController = {
  getHansardData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getHansardData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getHansardData()
      return validResponse(
        res,
        200,
        'All Latest Hansard News fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getHansardData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getResolutionsData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getResolutionsNews`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getResolutionsData()
      return validResponse(
        res,
        200,
        'All Resolutions Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getResolutionsData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getBillsData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getBillsData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getBillsData()
      return validResponse(
        res,
        200,
        'All Bills Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getBillsData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getOrdinancesData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getBillsData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getOrdinancesData()
      return validResponse(
        res,
        200,
        'All Ordinances Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getOrdinancesData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getRulingsData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getRulingsData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getRulingsData()
      return validResponse(
        res,
        200,
        'All Rulings Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getRulingsData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getActsData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getActsData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getActsData()
      return validResponse(
        res,
        200,
        'All Acts Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(`Error occurred on SenatorController: getActsData ${error}`)
      return errorResponse(res, error)
    }
  },
  getPressReleasesData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getPressReleasesData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getPressReleasesData()
      return validResponse(
        res,
        200,
        'All Press Releases Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getPressReleasesData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getCurrentMembersData: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getCurrentMembersData`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getCurrentMembersData()
      return validResponse(
        res,
        200,
        'All Current Members Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getCurrentMembersData ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getPublicPetition: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, params } = req
    const { refNumber, cnic } = params
    logger.info(
      `SenatorController: getPublicPetition params ${JSON.stringify(params)}`,
    )
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getPublicPetition(refNumber, cnic)
      return validResponse(
        res,
        200,
        `All Public Petition fetched by cnic: ${cnic} and refNumber: ${refNumber} successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getPublicPetition ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getAllMembers: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getAllMembers`)
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.getAllMembers()
      console.log("Result senate-public",result)
      return validResponse(
        res,
        200,
        `All Current Members Data fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getAllMembers ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  addPublicPetition: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, params, body } = req
    logger.info(
      `SenatorController: addPublicPetition params ${JSON.stringify(params)}`,
    )
    const service = new SenatorPublicService(db, logger)
    try {
      const result = await service.addPublicPetition(body)
      return validResponse(
        res,
        201,
        `Public Petition inserted successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: addPublicPetition ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  updatePassword: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, body } = req
    logger.info(
      `SenatorController: updatePassword body ${JSON.stringify(body)}`,
    )
    const service = new SenatorPublicService(db, winston)
    try {
      const result = await service.updatePassword(body)
      return validResponse(
        res,
        200,
        `Public User Password updated successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: updatePassword ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  addPublicNotification: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, params, body } = req
    winston.info(
      `SenatorController: addPublicNotification params ${JSON.stringify(
        params,
      )}`,
    )
    const service = new SenatorPublicService(db, winston)
    try {
      const result = await service.addPublicNotification(body)
      return validResponse(
        res,
        201,
        `Public Notification inserted successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: addPublicNotification ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getPublicNotification: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getPublicNotification`)
    const service = new SenatorPublicService(db, winston)
    try {
      const result = await service.getPublicNotification(db, winston)
      return validResponse(
        res,
        200,
        'All Acts Data fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getPublicNotification ${error}`,
      )
      return errorResponse(res, error)
    }
  },
}
module.exports = SenatorPublicController
