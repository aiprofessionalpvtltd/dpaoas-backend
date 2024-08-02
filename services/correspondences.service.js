const db = require("../models");
const Correspondences = db.correspondences
const CorrespondenceAttachments = db.correspondenceAttachments
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const correspondenceService = {

    // Create Correspondence
    createCorrespondence: async (req, files) => {
        try {
            const correspondence = await Correspondences.create({
                fkFileId: req.fkFileId ? req.fkFileId : null,
              //  fkCaseId: req.fkCaseId ? req.fkCaseId : null,
                fkBranchId: req.fkBranchId ? req.fkBranchId : null,
                name: req.name ? req.name : null,
                description: req.description ? req.description : null
            })

            console.log("Correspo",correspondence)
            if (files && files.length > 0) {
                const attachments = files.map(file => {
                    const path = file.destination.replace('./public/', '/assets/');
                    return {
                        file: `${path}/${file.filename}`,
                        fkCorrespondenceId: correspondence.id,
                    };
                });
                await CorrespondenceAttachments.bulkCreate(attachments);
            }
            // Handle single file and multiple files
            // if (files) {
            //     // Check if files is not an array (single file)
            //     if (!Array.isArray(files)) {
            //         files = [files];
            //     }

            //     if (files.length > 0) {
            //         const attachments = files.map(file => {
            //             const path = file.destination.replace('./public/', '/public/');
            //             return {
            //                 file: `${path}/${file.filename}`,
            //                 fkCorrespondenceId: correspondence.id,
            //             };
            //         });
            //         await CorrespondenceAttachments.bulkCreate(attachments);
            //     }
            // }

            return correspondence;
        } catch (error) {
            throw { message: error.message };

        }
    },


    // Get All Correspondences
    getAllCorrespondences: async (fileId, caseId, branchId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const where = {};
            if (caseId) {
                where.fkCaseId = caseId
            }
            if (branchId) {
                where.fkBranchId = branchId
            }
            if (fileId) {
                where.fkFileId = fileId
            }
            const { count, rows } = await Correspondences.findAndCountAll({
                where: where,
                // where: {
                //     fkBranchId: branchId,
                //     fkFileId: fileId,
                //     // fkCaseId: caseId
                // },
                include: [
                    {
                        model: CorrespondenceAttachments,
                        as: 'correspondenceAttachments',
                        attributes: ['id', 'file']
                    }
                ],
                offset,
                limit,
            });
            const totalPages = Math.ceil(count / pageSize);
            return { count: rows.length, totalPages, correspondences: rows };
        } catch (error) {
            throw new Error({ message: error.message });
        }
    },


    // Get Single Correspondence
    getSingleCorrespondence: async (correspondenceId) => {
        try {
            const correspondence = await Correspondences.findOne({
                where: { id: correspondenceId },
                include: [{
                    model: CorrespondenceAttachments,
                    as: 'correspondenceAttachments',
                    attributes: ['id', 'file']
                }]
            });
            if (!correspondence) {
                throw ({ message: "Correspondence Not Found!" })
            }
            return correspondence;
        } catch (error) {
            throw new Error({ message: error.message });

        }
    },

    // Update Correspondence
    updateCorrespondence: async (correspondenceId, req, files) => {
        try {
            let updateData = {
                name: req.name ? req.name : null,
                description: req.description ? req.description : null,
                status: req.status ? req.status : null
            };
            if (files && files.length > 0) {
                // Remove existing attachments for this FR
                // await CorrespondenceAttachments.destroy({
                //     where: { fkCorrespondenceId: correspondenceId }
                // });

                // Check if files array has elements
                if (files.length > 0) {
                    const attachments = files.map(file => {
                        const path = file.destination.replace('./public/', '/public/');
                        return {
                            file: `${path}/${file.filename}`,
                            fkCorrespondenceId: correspondenceId,
                        };
                    });
                    await CorrespondenceAttachments.bulkCreate(attachments);
                }
            }
            await Correspondences.update(updateData, { where: { id: correspondenceId } });
            const updatedCorres = await Correspondences.findOne({ where: { id: correspondenceId } });
            return updatedCorres;
        } catch (error) {
            throw { message: error.message };
        }
    },

    // Delete Correspondence
    deleteCorrespondence: async (correspondenceId) => {
        try {
            const updatedData =
            {
                status: "inactive"
            }
            await Correspondences.update(updatedData, { where: { id: correspondenceId } });
            const deletedCorrespondence = await Correspondences.findOne({ where: { id: correspondenceId } });
            return deletedCorrespondence;
        } catch (error) {
            throw { message: error.message };
        }
    },




}

module.exports = correspondenceService