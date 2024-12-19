const db = require("../models");
const Ministries = db.ministries;
const Users = db.users;
const Tenures = db.tenures;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const MinistriesService = {

    createMinistry: async (req) => {
        try {
            console.log("req", req);

            const ministry = await Ministries.create({
                ministryName: req.ministryName,
                ministryStatus: req.ministryStatus,
                fkTenureId: req.fkTenureId,
            });

            return ministry;
        } catch (error) {
            throw { message: error.message || "Error Creating ministries" };

        }
    },

    getAllMinistries: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await Ministries.findAndCountAll({
                include: [{ model: Tenures, as: "tenure" }],
                offset,
                limit,
                order: [["id", "ASC"]],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, ministries: rows };
        } catch (error) {
            throw new Error(error.message || "Error fetching all ministries");
        }
    },

    getMinistryById: async (id) => {
        try {
            const ministry = await Ministries.findOne({
                where: { id },
                include: [{ model: Tenures, as: "tenure" }],
            });
            if (!ministry) {
                throw ({ message: "Ministry not found!" })
            }
            return ministry;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single ministry" };
        }
    },

    updateMinistry: async (req, ministryId) => {
        try {

            await Ministries.update(req.body, { where: { id: ministryId } });

            // Fetch the updated Ministry after the update
            const updatedMinistry = await Ministries.findOne({
                where: { id: ministryId },
            }, { raw: true });

            return updatedMinistry;

        } catch (error) {
            throw { message: error.message || "Error Updating Bill Status" };
        }
    },

    deleteMinistry: async (req) => {
        try {

            const updatedData = {
                ministryStatus: "inactive"
            }

            await Ministries.update(updatedData, { where: { id: req } });

            // Fetch the updated Ministry after the update
            const updatedMinistry = await Ministries.findByPk(req, { raw: true });

            return updatedMinistry;


        } catch (error) {
            throw { message: error.message || "Error deleting Bill Status" };
        }
    }
}

module.exports = MinistriesService