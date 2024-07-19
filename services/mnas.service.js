const db = require("../models");
const MNAs = db.mnas;
const PoliticalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const mnaService = {
    // Create A New MNA
    createMNAs: async (req) => {
        try {

            const mna = await MNAs.create(req);

            return mna;
        } catch (error) {
            throw { message: error.message || "Error Creating mna" };

        }
    },

    // Retrieve All findAllMNAs
    findAllMNAs: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await MNAs.findAndCountAll({
                offset,
                limit,
                include: [
                    {
                        model: PoliticalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                ]
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, mnas: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All mnas");
        }
    },

    // Retrieve Single MNA
    findSinlgeMNA: async (mnnaId) => {
        try {
            const mna = await MNAs.findOne({
                where: { id: mnnaId },
                include: [
                    {
                        model: PoliticalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                ]
            });
            if (!mna) {
                throw ({ message: "mna Not Found!" })
            }
            return mna;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single mna" };
        }
    },

    // Update MNA Data
    updateMnaData: async (req, mnnaId) => {
        try {

            await MNAs.update(req.body, { where: { id: mnnaId } });

            // Fetch the updated MNA Data after the update
            const updatedMnaData = await MNAs.findOne({
                where: { id: mnnaId },
                include: [
                    {
                        model: PoliticalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                ]
            }, { raw: true });

            return updatedMnaData;

        } catch (error) {
            throw { message: error.message || "Error Updating MNA Data" };
        }
    },

    // Delete Mna
    deleteMna: async (req) => {
        try {

            const updatedData = {
                mnaStatus: "inactive"
            }

            await MNAs.update(updatedData, { where: { id: req } });

            // Fetch the updated MNA Data after the update
            const updatedMna = await MNAs.findByPk(req, { raw: true });

            return updatedMna;


        } catch (error) {
            throw { message: error.message || "Error deleting MNA Data" };
        }
    }


}

module.exports = mnaService