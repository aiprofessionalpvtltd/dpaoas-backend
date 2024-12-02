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

const getTranslationRemarks = async (req, res) => {
  try {
    const { fkQuestionId } = req.params; // Ensure fkQuestionId is extracted

    if (!fkQuestionId) {
      return res.status(400).json({
        message: "Question ID is required to fetch translation remarks.",
      });
    }

    const translationRemarks = await translationServices.getTranslationRemarks(
      fkQuestionId
    );

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

const getUserBranchHierarchy = async (req, res) => {
  try {
    logger.info(
      `casesController: getUserBranchHierarchy id ${JSON.stringify(
        req.params.id
      )}`
    );
    const userId = req.params.id;
    const branchHierarchyData = await translationServices.getUserBranchHierarchy(userId);
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
}

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


module.exports = {
  createTranslationRemark,
  getTranslationRemarks,
  getTranslationRemark,
  // getTranslationHierarchy,
  getUserBranchHierarchy,
  getTranslationHierarchy
};
