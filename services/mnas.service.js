const db = require("../models");
const MNAs = db.mnas;
const MnaMinistries = db.mnaMinistries
const PoliticalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');
const { log } = require("handlebars");


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
                where: { status: true },
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
                        attributes: ['id','ministryName', 'ministryStatus'],
                    },
                    {
                        model: db.tenures, as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
                    },
                ],
                order: [
                    ['id', 'DESC'],
                ],
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, mnas: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All mnas");
        }
    },

    // Fetch ministries related to a specific MNA
    findAllMinistriesByMinisterID: async (ministerID) => {
        try {

            const ministries = await db.mnas.findByPk(ministerID, {
                include: [{
                    model: db.ministries,
                    as: 'ministries',
                    through: { attributes: [] }, // Exclude the join table attributes
                    attributes: ['id','ministryName', 'ministryStatus'],
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
    findSingleMNA: async (mnnaId) => {
        try {
            const mna = await MNAs.findOne({
                where: { id: mnnaId },
                include: [
                    {
                        model: db.politicalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                    {
                        model: db.ministries,
                        as: 'ministries',
                        through: { attributes: [] }, // Exclude the join table attributes
                        attributes: ['id','ministryName', 'ministryStatus'],
                    },
                    {
                        model: db.tenures, as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
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
                        model: db.politicalParties,
                        as: 'politicalParties',
                        attributes: ['partyName', 'status'],
                    },
                    {
                        model: db.ministries,
                        as: 'ministries',
                        through: { attributes: [] }, // Exclude the join table attributes
                        attributes: ['ministryName', 'ministryStatus'],
                    },
                    {
                        model: db.tenures, as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
                    },
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
    },

    promoteMinisters: async (  newParliamentaryYearId, ministerID) => {
        const transaction = await db.sequelize.transaction();
    
        // console.log(newParliamentaryYearId, ministerID); return
        try {
            // Fetch the specific minister by ministerID
            const minister = await MNAs.findOne({
                where: { id: ministerID },
                transaction
            });
    
            if (!minister) {
                throw new Error('Minister not found');
            }
    
            // Update the status of the old minister to false (inactive)
            await minister.update(
                { status: false },
                {
                    where: { id: minister.id },
                    transaction
                }
            );
    
            let { mnaName, constituency, address, phone,
                politicalParty, mnaStatus, fkTenureId, fkParliamentaryYearId
                 } = minister;

        // Get the latest ID from the ministers table
        const latestMinister = await MNAs.findOne({
            order: [['id', 'DESC']],
            transaction
        });

        // Increment the latest ID by 1 for the new entry
            const newMinisterId = latestMinister ? latestMinister.id + 1 : 1;
            
            const ministerData = {
                id: newMinisterId,
                mnaName: minister.mnaName,
                constituency: minister.constituency,
                address: minister.address,
                phone: phone,  
                politicalParty: politicalParty,  
                mnaStatus: mnaStatus,  
                fkTenureId: fkTenureId,  
                fkParliamentaryYearId: newParliamentaryYearId,  
                 status: true // Set the status of the new record to active (true)
            };

          
            // Create a new minister record with the same data but a new fkParliamentaryYearId
            const newMinister = await MNAs.create(ministerData, { transaction });
    
            await transaction.commit();
            console.log('Minister promoted successfully');
            return newMinister;
        } catch (error) {
            await transaction.rollback();
            console.error('Error promoting minister:', error);
            throw error; // Handle the error as needed
        }
    },

      // Get Minister By Parliamentary Year ID
      getMinisterByParliamentaryYearID: async (id) => {
        try {

            const result = await MNAs.findAll({
                raw: false,
                where: {
                    fkParliamentaryYearId: id
                },
                include: [
                    {
                        model: db.tenures,
                        as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
                    },
                    {
                        model: db.politicalParties,
                        as: 'politicalParties',
                        attributes: ['id','partyName'],
                    }
                ],
            });
            return result
        } catch (error) {
            console.error('Error Fetching Minister request:', error.message);
        }
    },

}

module.exports = mnaService