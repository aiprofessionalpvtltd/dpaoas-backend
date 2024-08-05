const db = require("../models");
const MNAs = db.mnas;
const MnaMinistries = db.mnaMinistries
const PoliticalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const mnaService = {

    // Create A New MNA
    createMNAs: async (req) => {
        const { mnaData, ministryIds } = req;

        const transaction = await db.sequelize.transaction();

        try {
            // Create the MNA
            const mna = await MNAs.create(mnaData, { transaction });

            // Associate the MNA with existing ministries
            const ministryAssociations = await Promise.all(
                ministryIds.map(async (ministryId) => {
                    return await MnaMinistries.create({ mnaId: mna.id, ministryId }, { transaction });
                })
            );

            await transaction.commit();

            return { mna, ministryAssociations };
        } catch (error) {
            await transaction.rollback();
            throw { message: error.message || "Error Creating MNA and Ministries Associations" };
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
                    {
                        model: db.ministries,
                        as: 'ministries',
                        through: { attributes: [] }, // Exclude the join table attributes
                        attributes: ['ministryName', 'ministryStatus'],
                    }
                ]
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, mnas: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All mnas");
        }
    },

    // Fetch ministries related to a specific MNA
    findAllMinistriesByMnaId: async (mnaId) => {
        try {

            const ministries = await db.mnas.findByPk(mnaId, {
                include: [{
                    model: db.ministries,
                    as: 'ministries',
                    through: { attributes: [] }, // Exclude the join table attributes
                    attributes: ['ministryName', 'ministryStatus'],
                }]
            });

            if (!ministries) {
                throw ({ message: "ministries Not Found!" })
            }
            return ministries;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All ministries");
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
                    {
                        model: db.ministries,
                        as: 'ministries',
                        through: { attributes: [] }, // Exclude the join table attributes
                        attributes: ['ministryName', 'ministryStatus'],
                    }
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
    updateMnaData: async (req, mnaId) => {
        const { mnaData, ministryIds } = req.body;

        const transaction = await db.sequelize.transaction();

        try {
            // Update the MNA data
            await MNAs.update(mnaData, { where: { id: mnaId }, transaction });

            // Update MNA-Ministry associations if ministryIds are provided
            if (ministryIds) {
                // Remove existing associations
                await MnaMinistries.destroy({ where: { mnaId }, transaction });

                // Create new associations
                const ministryAssociations = await Promise.all(
                    ministryIds.map(async (ministryId) => {
                        return await MnaMinistries.create({ mnaId, ministryId }, { transaction });
                    })
                );
            }

            // Fetch the updated MNA data after the update
            const updatedMnaData = await MNAs.findOne({
                where: { id: mnaId },
                include: [
                    {
                        model: PoliticalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                    {
                        model: db.ministries,
                        as: 'ministries',
                        through: { attributes: [] }, // Exclude the join table attributes
                        attributes: ['ministryName', 'ministryStatus'],
                    }
                ],
                transaction
            });

            await transaction.commit();

            return updatedMnaData;

        } catch (error) {
            await transaction.rollback();
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