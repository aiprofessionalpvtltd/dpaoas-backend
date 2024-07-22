const sessionsService = require("../services/sessions.service")
const db = require("../models")
const Sessions = db.sessions
const logger = require('../common/winston');
const {
  validationErrorResponse,
  notFoundResponse,
  unAuthorizedResponse,
} = require('../common/validation-responses')
const sessionController = {

  // Create Session 
  createSession: async (req, res) => {
    try {
      logger.info(`sessionsController: createSession body ${JSON.stringify(req.body)}`)
      const session = await sessionsService.createSession(req.body);
      logger.info("Session Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Session Created Successfully!",
        data: session,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  //Retrive All Sessions
  geAllSessions: async (req, res) => {
    try {
      logger.info(`sessionsController: geAllSessions query ${JSON.stringify(req.query)}`)
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, sessions } = await sessionsService.getAllSessions(currentPage, pageSize);
      if (sessions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!'
        });
      }
      logger.info("Sessions Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Sessions Fetched Successfully!",
        data: {
          sessions,
          totalPages,
          count
        }
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrive Single Session
  getSingleSession: async (req, res) => {
    try {
      logger.info(`sessionsController: getSingleSession id ${JSON.stringify(req.params.id)}`)
      const sessionId = req.params.id;
      const fetchedSession = await sessionsService.getSingleSession(sessionId);
      logger.info("Single Session Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Session Fetched Successfully!",
        data: fetchedSession,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  //Update Session
  updateSession: async (req, res) => {
    try {
      logger.info(`sessionsController: updateSession id and body ${JSON.stringify(req.params.id, req.body)}`)
      const sessionId = req.params.id;
      const session = await Sessions.findByPk(sessionId);
      if (!session) {
        return res.status(200).send({
          success: true,
          message: "Session Not Found!",
        })
      }
      const updatedSession = await sessionsService.updateSession(req, sessionId);
      logger.info("Session Updated Successfully!")
      return res.status(200).send({
        success: true,
        message: "Session Updated Successfully!",
        data: updatedSession,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }

  },

  // Delete Session
  deleteSession: async (req, res) => {
    try {
      logger.info(`sessionsController: deleteSession id ${JSON.stringify(req.params.id)}`)
      const sessionId = req.params.id;
      const session = await Sessions.findByPk(sessionId);
      if (!session) {
        return res.status(200).send({
          success: true,
          message: "Session Not Found!",
        })
      }
      const deletedSession = await sessionsService.deleteSession(sessionId);
      logger.info("Session Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Session Deleted Successfully!",
        data: deletedSession,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }

  },


}


module.exports = sessionController