// services/lawAct.service.js

const db = require("../../models");
const LawAct = db.lawAct;
const { Op } = require('sequelize');

const lawActService = {
    // Retrieve All LawActs
    findAllLawActs: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LawAct.findAndCountAll({
                // where: { status: 'active' },
                offset,
                limit,
                order: [['id', 'ASC']],
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, lawActs: rows };
        } catch (error) {
            throw new Error(error.message || "Error fetching all law acts");
        }
    },

    // Create A New LawAct
    createLawAct: async (req) => {
        try {
            const lawAct = await LawAct.create(req);
            return lawAct;
        } catch (error) {
            throw { message: error.message || "Error creating law act" };
        }
    },

    // Retrieve Single LawAct
    findSingleLawAct: async (lawActId) => {
        try {
            const lawAct = await LawAct.findOne({ where: { id: lawActId } });
            if (!lawAct) {
                throw { message: "Law Act not found!" };
            }
            return lawAct;
        } catch (error) {
            throw { message: error.message || "Error fetching single law act" };
        }
    },

    // Update LawAct
    updateLawAct: async (lawActId, req) => {
        try {
            const lawAct = await LawAct.findOne({ where: { id: lawActId } });
            if (!lawAct) {
                throw { message: "Law Act not found!" };
            }

            await LawAct.update(req.body, { where: { id: lawActId } });

            const updatedLawAct = await LawAct.findOne({ where: { id: lawActId } });
            return updatedLawAct;
        } catch (error) {
            throw { message: error.message || 'Error updating law act' };
        }
    },

    // Delete LawAct (soft delete)
    deleteLawAct: async (lawActId) => {
        try {
            const lawAct = await LawAct.findOne({ where: { id: lawActId } });
            if (!lawAct) {
                throw { message: "Law Act not found!" };
            }

            await LawAct.update({ status: "inactive" }, { where: { id: lawActId } });

            const updatedLawAct = await LawAct.findOne({ where: { id: lawActId } });
            return updatedLawAct;
        } catch (error) {
            throw { message: error.message || "Error deleting law act" };
        }
    }
};

module.exports = lawActService;