const { validationResult } = require('express-validator')
const SenatorAppService = require('../services/senator-app.service')
const {
  validationErrorResponse,
  validResponse,
  errorResponse,
} = require('../common/validation-responses')
const logger = require('../common/winston');
const SenatorAppController = {
  getLatestNews: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getLatestNews`)
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getLatestNews()
      return validResponse(
        res,
        200,
        'All Latest News fetched successfully',
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getLatestNews ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getLegislative: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getLegislative`)
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getLegislative()
      return validResponse(
        res,
        200,
        `All Legislative Business fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getLegislative ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getSessionNumbers: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getSessionNumbers`)
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getSessionNumbers()
      return validResponse(
        res,
        200,
        `All Session Numbers fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getSessionNumbers ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getNonLegislative: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getNonLegislative`)
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getNonLegislative()
      return validResponse(
        res,
        200,
        `All Non Legislative Business fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getNonLegislative ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getCommitteeMeetings: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, query } = req
    const { timePeriod } = query
    
    // winston.info(
    //   `SenatorController: getCommitteeMeetings timePeriod=${timePeriod}`,
    // )
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getCommitteeMeetings(timePeriod)
      console.log("result-->>>", result)
      return validResponse(
        res,
        200,
        `All Committee Meeting fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getCommitteeMeetings ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  addSpeechOnDemand: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user, body } = req
    winston.info(
      `SenatorController: addSpeechOnDemand body ${JSON.stringify(body)}`,
    )
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.addSpeechOnDemand(user.id, body)
      return validResponse(
        res,
        201,
        `Speech on Demand added successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: addSpeechOnDemand ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getSessionAgenda: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    winston.info(`SenatorController: getSessionAgenda`)
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getSessionAgenda()
      return validResponse(
        res,
        200,
        `All Session Agenda Meeting fetched successfully`,
        result,
      )
    } catch (error) {
      winston.error(
        `Error occurred on SenatorController: getSessionAgenda ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getCommitteeReports: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getCommitteeReports`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getCommitteeReports();
      return validResponse(
        res,
        200,
        `All Committee Reports fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getCommitteeReports ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getQuestionsAnswers: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getQuestionsAnswers`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getQuestionsAnswers()
      return validResponse(
        res,
        200,
        `All Questions Answers fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getQuestionsAnswers ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getOrderOfDay: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getOrderOfDay`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getOrderOfDay()
      return validResponse(
        res,
        200,
        `All Order of Day fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getOrderOfDay ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getSpeechOnDemand: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user } = req
    logger.info(`SenatorController: getSpeechOnDemand`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getSpeechOnDemand(user.id)
      return validResponse(
        res,
        200,
        `All  Speech on Demand fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getSpeechOnDemand ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getSenatePublications: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getSenatePublications`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getSenatePublications()
      return validResponse(
        res,
        200,
        `All Senate Publications fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getSenatePublications ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getSenatePressRelease: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user, params } = req
    const { memberId } = params
    logger.info(
      `SenatorController: getSenatePressRelease with user ${user.id} and member Id ${memberId}`,
    )
    const service = new SenatorAppService(db, winston)
    try {
      const result = await service.getSenatePressRelease(memberId)
      return validResponse(
        res,
        200,
        `Own Press Release By Member Id ${memberId} fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getSenatePressRelease ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getMembersByCountryId: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, params } = req
    const { countryId } = params
    logger.info(
      `SenatorController: getMembersByCountryId countryId: ${countryId}`,
    )
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getMembersByCountryId(countryId)
      return validResponse(res, 200, `All Members fetched successfully`, result)
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getMembersByCountryId ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getParliamentaryFriendship: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db } = req
    logger.info(`SenatorController: getParliamentaryFriendship`)
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getParliamentaryFriendship()
      return validResponse(
        res,
        200,
        `All parliamentary Friendship fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getParliamentaryFriendship ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getCommitteeReportsByMember: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user, params } = req
    const { memberId } = params
    logger.info(
      `SenatorController: getCommitteeReportsByMember with user ${user.id} and member Id ${memberId}`,
    )
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getCommitteeReportsByMember(memberId)
      console.log("result*********", result)
      return validResponse(
        res,
        200,
        `All Committee Reports by member Id ${memberId} fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getCommitteeReportsByMember ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getCommitteeMeetingsByMember: async (req, res) => {
    console.log("data--->>")
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user, params, query } = req
    const { memberId } = params
    const { timePeriod } = query

    logger.info(
      `SenatorController: getCommitteeMeetingsByMember with user ${user.id} and member Id ${memberId}`,
    )
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getCommitteeMeetingsByMember(
        memberId,
        timePeriod,
      )
      //console.log("result------>>>", result)
      return validResponse(
        res,
        200,
        `All Committee Meeting By Member Id ${memberId} fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getCommitteeMeetingsByMember ${error}`,
      )
      return errorResponse(res, error)
    }
  },
  getParliamentaryFriendshipByMember: async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) return validationErrorResponse(res, errors.array())

    const { winston, db, user, params } = req
    const { memberId } = params
    logger.info(
      `SenatorController: getParliamentaryFriendship with user ${user.id} and member Id ${memberId}`,
    )
    const service = new SenatorAppService(db, logger)
    try {
      const result = await service.getParliamentaryFriendshipByMember(memberId)
      return validResponse(
        res,
        200,
        `All parliamentary Friendship By Member Id ${memberId} fetched successfully`,
        result,
      )
    } catch (error) {
      logger.error(
        `Error occurred on SenatorController: getParliamentaryFriendshipByMember ${error}`,
      )
      return errorResponse(res, error)
    }
  },
}
module.exports = SenatorAppController
