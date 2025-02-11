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
    if (!data.assignedTo || !data.category) {
      return res.status(400).json({
        message: "Missing required fields: assignedTo and category.",
      });
    }

    // Validate category-specific ID
    if (data.category === 'Question' && !data.fkQuestionId ||
        data.category === 'Motion' && !data.fkMotionId ||
        data.category === 'Resolution' && !data.fkResolutionId ||
        data.category === 'GovernmentBill_FromNA' && !data.fkIntroducedInSenateId ||
        data.category === 'GovernmentBill_FromSenate' && !data.fkIntroducedInSenateId ||
        data.category === 'PrivateBill_FromNA' && !data.fkIntroducedInSenateId ||
        data.category === 'PrivateBill_FromSenate' && !data.fkIntroducedInSenateId ||
        data.category === 'FinanceGovernmentBill_FromNA' && !data.fkFinanceMoneyBillId

      ) {
      return res.status(400).json({
        message: `Missing required ID field for category ${data.category}`,
      });
    }

    const result = await translationServices.createRemarkService({ ...data, submittedBy });

    return res.status(201).json({
      message: "Remark created/updated and assigned successfully.",
      data: result,
    });
  } catch (error) {
    console.error("Error in createRemark controller:", error);
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
      return res.status(201).json({
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

const getMotionIdRemarks = async (req, res) => {
  try {
    const { fkMotionId, userId } = req.params; 
    
    if (!fkMotionId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkMotionId and userId.",
      });
    }

    const remarks = await translationServices.getMotionIdRemarksService({ fkMotionId, userId });

    if (!remarks || remarks.length === 0) {
      return res.status(201).json({
        message: "No remarks found for this user on the specified motion.",
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

const getResolutionIdRemarks = async (req, res) => {
  try {
    const { fkResolutionId, userId } = req.params; 
    
    if (!fkResolutionId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkResolutionId and userId.",
      });
    }

    const remarks = await translationServices.getResIdRemarksService({ fkResolutionId, userId });

    if (!remarks || remarks.length === 0) {
      return res.status(201).json({
        message: "No remarks found for this user on the specified motion.",
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
      return res.status(201).json({
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

const getAllMotionRemarks = async (req, res) => {
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

    const result = await translationServices.getAllMotionsWithRemarks(
      userId,
      category,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(201).json({
        success: true,  
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

const getAllResolutionRemarks = async (req, res) => {
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

    const result = await translationServices.getAllResolutionsWithRemarks(
      userId,
      category,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(201).json({
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

const getGovernmentBillRemarks = async (req, res) => {
  try {
    const { fkIntroducedInSenateId, userId } = req.params;
    const { category } = req.query;

    console.log("Request Params:", category, fkIntroducedInSenateId, userId);
    

    if (!fkIntroducedInSenateId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkIntroducedInSenateId, userId, and billFrom.",
      });
    }

    const remarks = await translationServices.getGovernmentBillRemarksService({ 
      fkIntroducedInSenateId, 
      userId,
      category
    });

    if (!remarks || remarks.length === 0) {
      return res.status(201).json({
      success: true,  
        message: `No remarks found for this government bill from ${category}.`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Government bill remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getGovernmentBillRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
      data: []
    });
  }
};

const getAllGovernmentBillRemarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const { category } = req.query;
    const currentPage = parseInt(req.query.currentPage) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await translationServices.getAllGovernmentBillsWithRemarks(
      userId,
      category,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(201).json({
        message: `No assigned government bills from ${category} found for this user.`,
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Assigned government bills and remarks fetched successfully.",
      ...result
    });
  } catch (error) {
    console.error("Error in getAllGovernmentBillRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
    });
  }
};

const getFinanceMoneyBillRemarks = async (req, res) => {
  try {
    const { fkFinanceMoneyBillId, userId } = req.params;
    const category = 'FinanceGovernmentBill_FromNA';

    if (!fkFinanceMoneyBillId || !userId) {
      return res.status(400).json({
        message: "Missing required fields: fkFinanceMoneyBillId and userId",
      });
    }

    const remarks = await translationServices.getFinanceMoneyBillRemarksService({ 
      fkFinanceMoneyBillId, 
      userId,
      category
    });

    if (!remarks || remarks.length === 0) {
      return res.status(201).json({
        success: true,  
        message: "No remarks found for this finance money bill.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Finance money bill remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getFinanceMoneyBillRemarks:", error);
    return res.status(500).json({
      success: false,  
      message: error.message || "Internal server error.",
      data: []
    });
  }
};

const getAllFinanceMoneyBillRemarks = async (req, res) => {
  try {
    const { userId } = req.params;
    const category = 'FinanceGovernmentBill_FromNA';
    const currentPage = parseInt(req.query.currentPage) || 0;
    const pageSize = parseInt(req.query.pageSize) || 10;

    const result = await translationServices.getAllFinanceMoneyBillsWithRemarks(
      userId,
      category,
      currentPage,
      pageSize
    );

    if (!result.data || result.data.length === 0) {
      return res.status(201).json({
        message: "No assigned finance money bills found.",
        data: [],
      });
    }

    return res.status(200).json({
      success: true,  
      message: "Assigned finance money bills and remarks fetched successfully.",
      ...result
    });
  } catch (error) {
    console.error("Error in getAllFinanceMoneyBillRemarks:", error);
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
  getMotionIdRemarks,
  getResolutionIdRemarks,
  getAllRemarks,
  getAllMotionRemarks,
  getAllResolutionRemarks,
  getGovernmentBillRemarks,
  getAllGovernmentBillRemarks,
  getFinanceMoneyBillRemarks,
  getAllFinanceMoneyBillRemarks,
};

