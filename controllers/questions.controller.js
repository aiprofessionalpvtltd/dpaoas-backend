const questionsService = require("../services/questions.service")
const db = require("../models")
const Questions = db.questions
const QuestionRevival = db.questionRevival
const QuestionInList = db.questionQuestionLists
const QuestionInSupList = db.questionSupplementaryLists
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
      logger.info("Question submitted!")
      return res.status(200).send({
        success: true,
        message: "Submitted",
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
      const questionSentStatus = req.query.questionSentStatus ? req.query.questionSentStatus : null;
      const { count, totalPages, questions } = await questionsService.getAllQuestions(currentPage, pageSize,questionSentStatus);
      if (questions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!',
          data: { questions }
        });
      }
      else {
        logger.info("All questions fetched successfully!");
        return res.status(200).send({
          success: true,
          message: "All questions fetched successfully!",
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

  
      // Retrieves counts and data of questions by status
      getQuestionsByStatus: async (req, res) => {
        try {
            const statuses = ['inQuestion', 'toQuestion'];
            const result = await questionsService.getQuestionsByStatus(statuses);

            return res.status(200).send({
                success: true,
                message: "Questions fetched successfully!",
                data: result
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

  // Retrieve All Questions In Notice Branch
  getAllQuestionsInNotice: async (req, res) => {
    try {
      logger.info(`questionsController: getAllQuestionsInNotice query ${JSON.stringify(req.query)}`)
      const currentPage = parseInt(req.query.currentPage);
      const pageSize = parseInt(req.query.pageSize);
      const { count, totalPages, questions } = await questionsService.getAllQuestionsInNotice(currentPage, pageSize);
      if (questions.length === 0) {
        logger.info("No data found on this page!")
        return res.status(200).send({
          success: true,
          message: 'No data found on this page!',
          data: { questions }
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


  // Group Diary of Questions
  getQuestionGroupDiary: async (req, res) => {
    try {
      logger.info(`questionsController: getQuestionGroupDiary query ${JSON.stringify(req.query)}`)
      const session = req.query.session;
      const questionCategory = req.query.questionCategory
      const group = req.query.group
      const groupDiary = await questionsService.getQuestionGroupDiary(session, questionCategory, group)
      if (groupDiary) {
        logger.info("Question group diary fetched successfully!")
        return res.status(200).send({
          success: true,
          message: "Question group diary fetched successfully!",
          data: groupDiary,
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

  // Get Questions - Under Process
  getUnderProcessQuestions: async (req, res) => {
    try {
      logger.info(`questionsController: getQuestionUnderProcess query ${JSON.stringify(req.query)}`)
      const session = req.query.session;
      const questionCategory = req.query.questionCategory
      const group = req.query.group
      const underProcessQuestions = await questionsService.getUnderProcessQuestions(session, questionCategory, group)
      if (underProcessQuestions) {
        logger.info("Under process questions fetched successfully!")
        return res.status(200).send({
          success: true,
          message: "Under process questions fetched successfully!",
          data: underProcessQuestions,
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

  // Get Questions Summary - Question Statuses Count
  getQuestionsSummary: async (req, res) => {
    try {
      logger.info(`questionsController: getQuestionsSummary query ${JSON.stringify(req.query)}`)
      const fromSession = req.query.fromSession;
      const toSession = req.query.toSession
      const questionsSummary = await questionsService.getQuestionsSummary(fromSession, toSession)
      if (questionsSummary) {
        logger.info("Questions summary fetched successfully!")
        return res.status(200).send({
          success: true,
          message: "Questions summary fetched successfully!",
          data: [questionsSummary],
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

  // Get Deferred Questions - Current Session
  getDeferredQuestions: async (req, res) => {
    try {

      logger.info(`questionsController: getDeferredQuestions query ${JSON.stringify(req.query)}`)
      const currentPage = req.query.currentPage;
      const pageSize = req.query.pageSize;
      const { count, totalPages, questions } = await questionsService.getDeferredQuestions(currentPage, pageSize)
      if (questions.length > 0) {
        logger.info("Deferred questions fetched successfully!")
        return res.status(200).send({
          success: true,
          message: "Deferred questions fetched successfully!",
          data: { count, totalPages, questions },
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

  // Get Deleted Questions
  getDeletedQuestions: async (req, res) => {
    try {
      logger.info(`questionsController: getDeletedQuestions query ${JSON.stringify(req.query)}`)
      if (Object.keys(req.query).length !== 0) {
        const searchCriteria = req.query;
        const currentPage = req.query.currentPage;
        const pageSize = req.query.pageSize;
        const { count, totalPages, questions } = await questionsService.getDeletedQuestions(searchCriteria, currentPage, pageSize);
        if (questions.length > 0) {
          logger.info("Deleted questions search results!");
          return res.status(200).send({
            success: true,
            message: "Deleted questions search results!",
            data: { count, totalPages, questions },
          });
        } else {
          logger.info("Data Not Found!");
          return res.status(200).send({
            success: true,
            message: "Data Not Found!",
            data: { questions: questions },
          });
        }
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Remove Questions From List
  removeQuestionsFromList: async (req, res) => {
    try {
      logger.info(`questionsController: removeQuestionsFromList id ${JSON.stringify(req.params.id)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question not found!",
        })
      }
      const questionInList = await QuestionInList.findOne({
        where: { fkQuestionId: questionId }
      });

      const questionInSupList = await QuestionInSupList.findOne({
        where: { fkQuestionId: questionId }
      });

      if (!questionInList && !questionInSupList) {
        logger.info("Question not found in question list or question supplementary list!")
        return res.status(200).send({
          success: true,
          message: "Question not found in question list or question supplementary list!",
        });
      }
      await questionsService.removeQuestionsFromList(questionId)
      logger.info("Question removed from list successfully!")
      return res.status(200).send({
        success: true,
        message: "Question removed from list successfully!",
      })

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
      logger.info("Single question fetched successfully!")
      return res.status(200).send({
        success: true,
        message: "Single question fetched successfully!",
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

  // Retrieve all Question by web_id
  findAllQuestionsByWebId: async (req, res) => {
    try {
      logger.info(`questionsController: getallQuestion by web_id ${JSON.stringify(req.query.web_id)}`)
      const webId = req.query.web_id;
      console.log("web id", webId)
      const questions = await questionsService.findAllQuestionsByWebId(webId);
      questions.forEach(question => {
        if(question.questionImage && question.questionImage[0]){
          question.questionImage = JSON.parse(question.questionImage[0]);
        } else {
          question.questionImage = null;
        }
      });
      logger.info("Questions fetched successfully!")
      return res.status(200).send({
        success: true,
        message: "Questions fetched successfully!",
        data: { questions },
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
        logger.info("Question statuses fetched successfully!")
        return res.status(200).send({
          success: true,
          message: "Question statuses fetched successfully!",
          data: quesStatuses,
        })
      }
      else {
        logger.info("No data found!")
        return res.status(200).send({
          success: true,
          message: "No data found!",

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
        return res.status(200).send({
          success: true,
          message: "Question not found!",
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
        logger.info("Question updated successfully!");
        return res.status(200).send({
          success: true,
          message: "Question updated successfully!",
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

  // Change Question Status
  changeQuestionStatus: async(req,res) => {
    try {
      logger.info(`questionsController: changeQuestionStatus body ${JSON.stringify(req.body)}`)
      

      // Update the question with new information excluding the attachments
      const updatedQuestion = await questionsService.changeQuestionStatus(req.body);
  
        logger.info("Question's Status Changed Successfully!");
        return res.status(200).send({
          success: true,
          message: "Question's Status Changed Successfully!",
          data: updatedQuestion,
        });
      

    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },
  // Send To Question
  sendToQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: sendToQuestion id ${JSON.stringify(req.params.id)} and body ${JSON.stringify(req.body)}`)
      const questionId = req.params.id;
      const question = await Questions.findByPk(questionId);
      if (!question) {
        return res.status(200).send({
          success: true,
          message: "Question Not Found!",
        })
      }
      const updatedQuestion = await questionsService.sendToQuestion(req.body, questionId);
      logger.info("Question sent to concerned branch successfully!")
      return res.status(200).send({
        success: true,
        message: "Question sent to concerned branch successfully!",
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

  //Search Question
  searchQuestion: async (req, res) => {
    try {
      logger.info(`questionsController: searchQuestion query ${JSON.stringify(req.query)}`)
      if (Object.keys(req.query).length !== 0) {
        const searchCriteria = req.query;
        const currentPage = parseInt(req.query.currentPage);
        const pageSize = parseInt(req.query.pageSize);
        const { count, totalPages, questions } = await questionsService.searchQuestion(searchCriteria, currentPage, pageSize);

        if (questions.length > 0) {
          logger.info("Searched Successfully!");
          return res.status(200).send({
            success: true,
            message: "Questions search results!",
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
            message: "Data not found!",
            data: { questions },
          });
        }
      }
      else {
        logger.info("Please Enter Any Field To Search!");
        return res.status(200).send({
          success: true,
          message: "Please enter any field to search!",
          data: []
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
          message: "Question not found!",
        })
      }
      const deferQuestion = await questionsService.deferQuestion(req.body, question)
      logger.info("Question Deferred Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question deferred successfully!",
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
          message: "Question not found!",
        })
      }
      const revivedQuestion = await questionsService.reviveQuestion(req.body, question)
      logger.info("Question Revived Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question revived successfully!",
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
          message: "All revived questions fetched successfully!",
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
          message: "Revived question not found!",
        })
      }
      const singleQuestion = await questionsService.getSingleReviveQuestion(revQuestionId);
      logger.info("Single Revived Question Fetched Successfully!")
      return res.status(200).send({
        success: true,
        message: "Single revived question fetched successfully!",
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
          message: "Question not found!",
        })
      }
      const questionHistories = await questionsService.getQuestionHistories(questionId)
      if (questionHistories) {
        logger.info("Question Histories Fetched Successfully!")
        return res.status(200).send({
          success: true,
          message: "Question histories fetched successfully!",
          data: questionHistories,
        })
      }
      else {
        logger.info("Data Not Found!")
        return res.status(200).send({
          success: true,
          message: "Data not found!",
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
          message: "Question not found!",
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
        message: "Question sent for translation successfully!",
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
          message: "Question not found!",
        })
      }
      const deletedQuestion = await questionsService.deleteQuestion(req.body, questionId);
      logger.info("Question Deleted Successfully!")
      return res.status(200).send({
        success: true,
        message: "Question deleted successfully!",
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