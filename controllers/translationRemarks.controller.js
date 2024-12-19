const { response } = require("express");
const logger = require("../common/winston");

const translationServices = require("../services/translationRemarks.service");
// const Questions = db.questions;
// const createTranslationRemark = async (req, res) => {
//     try {
//         const data = req.body;
//         console.log(data)
//         const submittedBy = req.user ? req.user.id : null;

//         if (!data.fkQuestionId || !data.comment) {
//             return res.status(400).json({
//                 message: "Missing required fields: fkQuestionId and comment.",
//             });
//         }

//         const translationRemark = await translationServices.createTranslationRemark(data, submittedBy);

//         return res.status(201).json({
//             message: "Translation Remark created successfully",
//             data: translationRemark,
//         });
//     } catch (error) {
//         console.error("Error in createTranslationRemark:", error);
//         return res.status(400).json({
//             message: error.message || "Failed to create Translation Remark",
//         });
//     }
// };

const createTranslationRemark = async (req, res) => {
  try {
    const data = req.body;
    console.log("Request Data:", data);

    const submittedBy = req.user ? req.user.id : null;
    console.log("Submitted By ID:", submittedBy);

    if (!data.fkQuestionId || !data.comment) {
      return res.status(400).json({
        message: "Missing required fields: fkQuestionId and comment.",
      });
    }

    const translationRemark = await translationServices.createTranslationRemark(
      data,
      submittedBy
    );

    return res.status(201).json({
      message: "Translation Remark created successfully",
      data: translationRemark,
    });
  } catch (error) {
    console.error("Error in createTranslationRemark:", error);
    return res.status(400).json({
      message: error.message || "Failed to create Translation Remark",
    });
  }
};



// const getAssignedRemarks = async (req, res) => {
//   try {
//     const userId = req.params.userId;

//     if (!userId) {
//       return res.status(401).json({
//         message: "Unauthorized: User ID is required.",
//       });
//     }

//     const assignedRemarks = await translationServices.getRemarksAssignedToUser(userId);

//     return res.status(200).json({
//       message: "Assigned remarks fetched successfully.",
//       data: assignedRemarks,
//     });
//   } catch (error) {
//     console.error("Error fetching assigned remarks:", error);
//     return res.status(500).json({
//       message: error.message || "Failed to fetch assigned remarks.",
//     });
//   }
// };


const getAssignedRemarks = async (req, res) => {
  try {
    const userId = req.params.userId;

    if (!userId) {
      return res.status(401).json({
        message: "Unauthorized: User ID is required.",
      });
    }

    const assignedRemarks = await translationServices.getRemarksAssignedToUser(userId);

    return res.status(200).json({
      message: "Assigned remarks fetched successfully.",
      data: assignedRemarks,
    });
  } catch (error) {
    console.error("Error fetching assigned remarks:", error);
    return res.status(500).json({
      message: error.message || "Failed to fetch assigned remarks.",
    });
  }
};




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
      const branchId = req.params.branchId;
      const loggedInUserId = req.user.id; 
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

  

// const getBranchHierarchy = async (req, res) => {
//   try {
//       const branchId = req.params.branchId;
//       const loggedInUserId = req.user.id; // Assuming you have middleware to set req.user
//       logger.info(
//           `translationController: getBranchHierarchy branchId ${branchId}, loggedInUserId ${loggedInUserId}`
//       );

//       const branchHierarchyData = await translationServices.getBranchHierarchy(branchId, loggedInUserId);
//       logger.info("Branch Hierarchy Retrieved Successfully!");
//       return res.status(200).send({
//           success: true,
//           message: "Branch Hierarchy Retrieved Successfully!",
//           data: branchHierarchyData,
//       });
//   } catch (error) {
//       logger.error(error.message);
//       return res.status(400).send({
//           success: false,
//           message: error.message,
//       });
//   }
// };

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


/////Remarks-------------------------------
const createRemark = async (req, res) => {
  try {
    const data = req.body;
    const submittedBy = req.user ? req.user.id : null;

    // Validate input
    if (!data.fkQuestionId || !data.comment || !data.assignedTo) {
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


// const getRemarks = async (req, res) => {
//   try {
//     const { fkQuestionId } = req.params; // Get the question ID from the URL
//     const userId = req.user ? req.user.id : null; // Get the user ID from the request
    
//     // Validate input
//     if (!fkQuestionId || !userId) {
//       return res.status(400).json({
//         message: "Missing required fields: fkQuestionId and userId.",
//       });
//     }

//     // Call the service to get the remarks
//     const remarks = await translationServices.getRemarksService({ fkQuestionId, userId });

//     if (!remarks || remarks.length === 0) {
//       return res.status(404).json({
//         message: "No remarks found for this user on the specified question.",
//       });
//     }

//     return res.status(200).json({
//       message: "Remarks fetched successfully.",
//       data: remarks,
//     });
//   } catch (error) {
//     console.error("Error in getRemarks controller:", error);
//     return res.status(error.status || 500).json({
//       message: error.message || "Internal server error.",
//     });
//   }
// };


// const getRemarks = async (req, res) => {
//   try {
//     const { fkQuestionId } = req.params; // Get the question ID from the URL
//     const userId = req.user ? req.user.id : null; // Get the user ID from the request
    
//     // Validate input
//     if (!fkQuestionId || !userId) {
//       return res.status(400).json({
//         message: "Missing required fields: fkQuestionId and userId.",
//       });
//     }

//     // Call the service to get the remarks
//     const remarks = await translationServices.getRemarksService({ fkQuestionId, userId });

//     if (!remarks || remarks.length === 0) {
//       return res.status(404).json({
//         message: "No remarks found for this user on the specified question.",
//       });
//     }

//     return res.status(200).json({
//       message: "Remarks fetched successfully.",
//       data: remarks,
//     });
//   } catch (error) {
//     console.error("Error in getRemarks controller:", error);
//     return res.status(error.status || 500).json({
//       message: error.message || "Internal server error.",
//     });
//   }
// };


const getRemarks = async (req, res) => {
  try {
    const { fkQuestionId } = req.params; 
    const userId = req.user ? req.user.id : null; 
    
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
      message: "Remarks fetched successfully.",
      data: remarks,
    });
  } catch (error) {
    console.error("Error in getRemarks controller:", error);
    return res.status(error.status || 500).json({
      message: error.message || "Internal server error.",
    });
  }
};




module.exports = {
  createTranslationRemark,
  getAssignedRemarks,
  getTranslationRemarks,
  // getTranslationRemark,
  // getTranslationHierarchy,
  getBranchHierarchy,
  getTranslationHierarchy,

  createRemark,
  getRemarksByQuestionId,
  getRemarks
};

