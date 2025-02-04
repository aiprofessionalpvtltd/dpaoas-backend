const { response } = require("express");
const logger = require("../common/winston");

const translationServices = require("../services/translationRemarks.service");

const getTranslationRemarks = async (req, res) => {
  try {
    const { fkQuestionId } = req.params; 

   if (!fkQuestionId) {
      return res.status(400).json({
        message: "Question ID is required to fetch translation remarks.",
      });
    }

    const translationRemarks = await translationServices.getTranslationRemarks(
      fkQuestionId
    );
    
    if (translationRemarks.length === 0) {
      return res.status(404).json({
        message: "No remarks found for the provided Question ID.",
        data: [],
      });
    }

    return res.status(200).json({
      message: "Translation Remarks fetched successfully",
      data: translationRemarks,
    });
  } catch (error) {
    console.error("Error in getTranslationRemarks:", error);
    return res.status(400).json({
      message: error.message || "Failed to fetch Translation Remarks",
    });
  }
};

const getBranchHierarchy = async (req, res) => {
  try {
    console.log("getBranchHierarchy", req.params);  
    
      const branchId = req.params.branchId;
      const loggedInUserId = req.params.userId; 
      logger.info(
          `translationController: getBranchHierarchy branchId ${branchId}, loggedInUserId ${loggedInUserId}`
      );

      const branchHierarchyData = await translationServices.getBranchHierarchy(branchId, loggedInUserId);
      logger.info("Branch Hierarchy Retrieved Successfully!");
      return res.status(200).send({
          success: true,
          message: "Branch Hierarchy Retrieved Successfully!",
          data: branchHierarchyData,
      });
  } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
          success: false,
          message: error.message,
      });
  }
};

const getTranslationHierarchy = async (req, res) => {
  try {
    logger.info(
      `translationController: getTranslationHierarchy id ${JSON.stringify(
        req.params.id
      )}`
    );
    const userId = req.params.id;
    const hierarchy = await translationServices.getTranslationHierarchy(userId);
    logger.info("Hierarchy Retrieved Successfully!");
    return res.status(200).send({
      success: true,
      message: "Hierarchy Retrieved Successfully!",
      data: hierarchy,
    });
  } catch (error) {
    logger.error(error.message);
    return res.status(400).send({
      success: false,
      message: error.message,
    });
  }
};

const createRemark = async (req, res) => {
  try {
    const data = req.body;
    const submittedBy = req.params?.userId;

    console.log("Request Data:", data);
    console.log("Submitted By ID:", submittedBy);

    // Validate input
    if (!data.fkQuestionId || !data.assignedTo) {
      return res.status(400).json({
        message: "Missing required fields: fkQuestionId, comment, and assignedTo.",
      });
    }

    const result = await translationServices.createRemarkService({ ...data, submittedBy });

    return res.status(201).json({
      message: "Remark created and question assigned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in createRemark controller:", error);
    console.error("Error details in createRemarkService:", error); // Log the error

    return res.status(error.status || 500).json({
      message: error.message || "Internal server error.",
    });
  }
};

const getRemarksByQuestionId = async (req, res) => {
  try {
    const { questionId } = req.params;

    // Validate input
    if (!questionId) {
      return res.status(400).json({ message: "Question ID is required." });
    }

    const remarks = await translationServices.getRemarksByQuestionIdService(questionId);

    return res.status(200).json({
      message: "Remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getRemarksByQuestionId controller:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error.",
    });
  }
};

const getRemarks = async (req, res) => {
  try {
    const { fkQuestionId, userId } = req.params; 

    console.log("Request Params:", req.params);
    
    
    if (!fkQuestionId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkQuestionId and userId.",
      });
    }

    const remarks = await translationServices.getRemarksService({ fkQuestionId, userId });

    if (!remarks || remarks.length === 0) {
      return res.status(404).json({
        message: "No remarks found for this user on the specified question.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getRemarks controller:", error);
    return res.status(error.status || 500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const getAllRemarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;
    const currentPage = parseInt(req.query.currentPage) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    // if (!userId) {
    //   return res.status(400).json({
    //     message: "User ID is required.",
    //   });
    // }

    const result = await translationServices.getAllAssignedQuestionsWithRemarks(
      userId, 
      category,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        message: `No assigned ${category || ''} remarks found for this user.`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assigned questions and remarks fetched successfully.",
      ...result
    });
  } catch (error) {
    console.error("Error in getAllRemarks controller:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const getMotionRemarks = async (req, res) => {
  try {
    const { fkMotionId, userId } = req.params;

    if (!fkMotionId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkMotionId and userId.",
      });
    }

    const remarks = await translationServices.getMotionRemarksService({ fkMotionId, userId });

    if (!remarks || remarks.length === 0) {
      return res.status(404).json({
        message: "No remarks found for this motion.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Motion remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getMotionRemarks:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error.",
    });
  }
};

const getAllMotionRemarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentPage = parseInt(req.query.currentPage) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const result = await translationServices.getAllMotionsWithRemarks(
      userId,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        message: "No assigned motions found for this user.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Assigned motions and remarks fetched successfully.",
      ...result
    });
  } catch (error) {
    console.error("Error in getAllMotionRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
    });
  }
};

const getResolutionRemarks = async (req, res) => {
  try {
    const { fkResolutionId, userId } = req.params;

    if (!fkResolutionId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkResolutionId and userId.",
      });
    }

    const remarks = await translationServices.getResolutionRemarksService({ fkResolutionId, userId });

    if (!remarks || remarks.length === 0) {
      return res.status(404).json({
        message: "No remarks found for this resolution.",
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Resolution remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getResolutionRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
    });
  }
};

const getAllResolutionRemarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const currentPage = parseInt(req.query.currentPage) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required.",
      });
    }

    const result = await translationServices.getAllResolutionsWithRemarks(
      userId,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(404).json({
        message: "No assigned resolutions found for this user.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Assigned resolutions and remarks fetched successfully.",
      ...result
    });
  } catch (error) {
    console.error("Error in getAllResolutionRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
    });
  }
};

module.exports = {
  getTranslationRemarks,
  getBranchHierarchy,
  getTranslationHierarchy,
  createRemark,
  getRemarksByQuestionId,
  getRemarks,
  getAllRemarks,
  getMotionRemarks,
  getAllMotionRemarks,
  getResolutionRemarks,
  getAllResolutionRemarks,
};

