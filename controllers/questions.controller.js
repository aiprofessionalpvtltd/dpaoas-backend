const questionsService = require("../services/questions.service")
const db = require("../models")
const Questions = db.questions
const QuestionRevival = db.questionRevival
const logger = require('../common/winston');
const {
  validationErrorResponse,
  notFoundResponse,
  unAuthorizedResponse,
} = require('../common/validation-responses')
const { v4: uuidv4 } = require('uuid');
const questionsController = {
  // Create A New Question
  createQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: createQuestion body ${JSON.stringify(req.body)}`)
      const question = await questionsService.createQuestion(req.body);
      if (!question) {
        // If question creation failed, send an error response immediately
        return res.status(400).send({
          success: false,
          message: "Error Creating Question!",
        });
      }

      let imageObjects = [];
      if (req.files && req.files.length > 0) {
        imageObjects = req.files.map((file, index) => {
          const path = file.destination.replace('./public/', '/public/') + file.originalname;
          const id = index + 1;
          return JSON.stringify({ id, path });
        });
      }

      // Fetch the existing question to update (if needed)
      const existingQuestion = await Questions.findOne({ where: { id: question.id } });
      const existingImages = existingQuestion ? existingQuestion.questionImage || [] : [];
      const updatedImages = [...existingImages, ...imageObjects];

      await Questions.update(
        { questionImage: updatedImages },
        { where: { id: question.id } }
      );

      // Fetch the updated question data to send in the response
      const updatedQuestion = await Questions.findOne({ where: { id: question.id } });
      if (updatedQuestion) {
        updatedQuestion.questionImage = updatedImages.map(imageString => JSON.parse(imageString));
      } else {
        updatedQuestion.questionImage = [];
      }
      logger.info("Question Created Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question Created Successfully!",
        data: updatedQuestion,
      });

    } catch (error) {
      logger.error(error.message);
      return res.status(500).send({
        success: false,
        message: error.message || "An error occurred during the question creation process.",
      });
    }
  },

  // Retrieve All Questions
  getAllQuestions: async (req, res) => {
    try {
      logger.info(`questionsController: getAllQuestions query ${JSON.stringify(req.query)}`)
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, questions } = await questionsService.getAllQuestions(currentPage, pageSize);
      if (questions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All Questions Fetched Successfully!");
        return res.status(200).send({
          success: true,
          message: "All Questions Fetched Successfully!",
          data: {
            questions,
            count,
            totalPages
          }
        });
      }
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrive Single Question
  getSingleQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: getSingleQuestion id ${JSON.stringify(req.params.id)}`)
      const questionId = req.params.id;
      const singleQuestion = await questionsService.getSingleQuestion(questionId);
      logger.info("Single Question Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Question Fetched Successfully!",
        data: singleQuestion,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Get Question Statuses
  getQuestionStatuses: async (req, res) => {
    try {
      logger.info(`questionsController: getQuestionStatuses`)
      const quesStatuses = await questionsService.getQuestionStatuses()
      if (quesStatuses) {
        logger.info("Question Statuses Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "Question Statuses Fetched Successfully!",
          data: quesStatuses,
        })
      }
      else {
        logger.info("No Data Found!")
        return res.status(200).send({
          success: true,
          message: "No Data Found!",

        })
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })

    }
  },

  // Update Question
  updateQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: updateQuestion id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(404).send({
          success: false,
          message: "Question Not Found!",
        });
      }

      // Update the question with new information excluding the attachments
      const updatedQuestion = await questionsService.updateQuestion(req.body, question, questionId);
      if (updatedQuestion) {
        if (req.files && req.files.length > 0) {

          const newAttachmentObjects = req.files.map((file, index) => {
            const path = file.destination.replace('./public/', '/public/') + file.originalname;
            const id = index + 1;
            return JSON.stringify({ id, path });
          });

          // Merge existing image objects with the new ones
          const updatedImages = [...newAttachmentObjects];

          // Update the questionImage field with the merged array of image objects
          await Questions.update(
            { questionImage: updatedImages },
            { where: { id: questionId } }
          );
        }

        const updatedQuestions = await Questions.findOne({ where: { id: questionId } });
        if (updatedQuestions && updatedQuestions.questionImage) {
          updatedQuestions.questionImage = updatedQuestions.questionImage.map(imageString => JSON.parse(imageString));
        }
        logger.info("Question Updated Successfully!");
        return res.status(200).send({
          success: true,
          message: "Question Updated Successfully!",
          data: updatedQuestions,
        });
      }

    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  //Search Question
  searchQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: searchQuestion query ${JSON.stringify(req.query)}`)
      if (Object.keys(req.query).length !== 0) {
        // Assuming the search criteria are passed as query parameters
        const searchCriteria = req.query; // This will be an object with search fields
        const currentPage = parseInt(req.query.currentPage);
        const pageSize = parseInt(req.query.pageSize);
        const { count, totalPages, questions } = await questionsService.searchQuestion(searchCriteria, currentPage, pageSize);

        if (questions.length > 0) {
          logger.info("Searched Successfully!");
          return res.status(200).send({
            success: true,
            message: "Questions Search Results!",
            data: {
              questions,
              count,
              totalPages
            },
          });
        } else {
          logger.info("Data Not Found!");
          return res.status(200).send({
            success: true,
            message: "Data Not Found!",
            data: questions,
          });
        }
      }
      else {
        logger.info("Please Enter Any Field To Search!");
        return res.status(200).send({
          success: true,
          message: "Please Enter Any Field To Search!",
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Defer Question
  deferQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: deferQuestion body ${JSON.stringify(req.body)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      const deferQuestion = await questionsService.deferQuestion(req.body, question)
      logger.info("Question Deferred Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question Deferred Successfully!",
        data: deferQuestion,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })

    }
  },

  // Revive The Question
  reviveQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: reviveQuestion body ${JSON.stringify(req.body)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      const revivedQuestion = await questionsService.reviveQuestion(req.body, question)
      logger.info("Question Revived Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question Revived Successfully!",
        data: revivedQuestion,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })

    }
  },

  // Get All Revived Questions
  getAllReviveQuestions: async (req, res) => {
    try {
      logger.info(`questionsController: getAllReviveQuestions query ${JSON.stringify(req.query)}`)
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, questions } = await questionsService.getAllReviveQuestions(currentPage, pageSize);
      if (questions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!'
        });
      }
      else {
        logger.info("All Revived Questions Fetched Successfully!");
        return res.status(200).send({
          success: true,
          message: "All Revived Questions Fetched Successfully!",
          data: questions,
          count,
          totalPages
        });
      }
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Retrive Single Revive Question
  getSingleReviveQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: getSingleReviveQuestion id ${JSON.stringify(req.params.id)}`)
      const revQuestionId = req.params.id;
      const question = await QuestionRevival.findOne({ where: { fkQuestionId: revQuestionId } })
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Revived Question Not Found!",
        })
      }
      const singleQuestion = await questionsService.getSingleReviveQuestion(revQuestionId);
      logger.info("Single Revived Question Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single Revived Question Fetched Successfully!",
        data: singleQuestion,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },


  // Get Quesion Histories
  getQuestionHistories: async (req, res) => {
    try {
      logger.info(`questionsController: getQuestionHistories id ${JSON.stringify(req.params.id)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      const questionHistories = await questionsService.getQuestionHistories(questionId)
      if (questionHistories) {
        logger.info("Question Histories Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "Question Histories Fetched Successfully!",
          data: questionHistories,
        })
      }
      else {
        logger.info("Data Not Found!")
        return res.status(200).send({
          success: true,
          message: "Data Not Found!",
        })
      }

    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })

    }
  },

  // Send For Translation
  sendForTranslation: async (req, res) => {
    try {
      logger.info(`questionsController: sendForTranslation id ${JSON.stringify(req.params.id)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      if (question.sentForTranslation === true) {
        return res.status(200).send({
          success: true,
          message: "Question is already sent for translation!",
        });
      }
      const updatedQuestion = await questionsService.sendForTranslation(questionId);
      logger.info(" Question Sent For Translation Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question Sent For Translation Successfully!",
        data: updatedQuestion,
      })
    } catch (error) {
      logger.error(error.message)
      return res.status(400).send({
        success: false,
        message: error.message
      })
    }
  },

  // Delete Question
  deleteQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: deleteQuestion id ${JSON.stringify(req.params.id)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      const deletedQuestion = await questionsService.deleteQuestion(questionId);
      logger.info("Question Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question Deleted Successfully!",
        data: deletedQuestion,
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

module.exports = questionsController