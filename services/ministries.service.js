const db = require("../models");
const Ministries = db.ministries;
const Users = db.users;
const Tenures = db.tenures;
const TenuresMinister = db.tenuresMinisters;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const MinistriesService = {

    createMinistry: async (req) => {
        try {
            console.log("req", req);

            const ministry = await Ministries.create({
                ministryName: req.ministryName,
                ministryStatus: req.ministryStatus,
                fkMinisterTenureId: req.fkMinisterTenureId,
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
                include: [{ model: TenuresMinister, as: "tenuresMinisters" }],
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
                include: [{ model: TenuresMinister, as: "tenuresMinisters" }],
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
    },

    getMinistriesByTenure: async (id) => {
        try {
            const ministries = await Ministries.findAll({
                where: { fkMinisterTenureId: id },
                attributes: ['id', 'ministryName', 'ministryStatus', 'fkMinisterTenureId'],
                include: [{ model: TenuresMinister, as: "tenuresMinisters" }],
            });
            return ministries;
        } catch (error) {
            throw { message: error.message || "Error fetching ministries by tenure ID." };
        }
    },
}

module.exports = MinistriesService