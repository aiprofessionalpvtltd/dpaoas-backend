const db = require("../models");
const ResearchServices = db.researchServices;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const researchService = {
    // Create A New Research Service
    createResearchServices: async (req) => {
        try {

            const researchService = await ResearchServices.create(req);

            return researchService;
        } catch (error) {
            throw { message: error.message || "Error Creating research Service" };

        }
    },

    // Retrieve All Research Services
    findAllResearchServices: async (currentPage, pageSize, isActive) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            let whereClause = {}
            if (isActive) {
                whereClause.isActive = isActive ? isActive : null
            }

            const { count, rows } = await ResearchServices.findAndCountAll({
                offset,
                limit,
                where: whereClause,
                order: [['id', 'DESC']],
            });
            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, researchServiceData: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All research Service Data");
        }
    },

    // Retrieve all Research Service by web_id
    findAllResearchServiceByWebId: async (webId) => {
        try {
            const researchServiceData = await ResearchServices.findAll({
                where: { web_id: webId },
                order: [['createdAt', 'DESC']]
            });
            if (!researchServiceData) {
                throw ({ message: "research Service Data Not Found!" })
            }
            return researchServiceData;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching research Service Data" };
        }
    },

    // Retrieve Single Research Service
    findSinlgeResearchService: async (researchServiceId) => {
        try {
            const researchServiceData = await ResearchServices.findOne({
                where: { id: researchServiceId },
            });
            if (!researchServiceData) {
                throw ({ message: "research Service Data Not Found!" })
            }
            return researchServiceData;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single research Service Data" };
        }
    },

    // Get Research Services Stats
    getResearchServicesStats: async () => {
        try {

            const { count, rows } = await ResearchServices.findAndCountAll()
            let receivedData = [];
            let requestInProcessData = [];
            let deliveredData = [];

            rows.forEach(stat => {
                const status = stat.isActive;
                switch (status) {
                    case 'Received':
                        receivedData.push(status);
                        break;
                    case 'Request In Process':
                        requestInProcessData.push(status);
                        break;
                    case 'Delivered':
                        deliveredData.push(status);
                        break;
                    default:
                        break;
                }
            });

            const stats = {
                received: receivedData.length,
                requestInProcess: requestInProcessData.length,
                delivered: deliveredData.length,
                totalResearches: receivedData.length + requestInProcessData.length + deliveredData.length,
            };

            return stats


        } catch (error) {
            console.log(error)
            throw new Error({ message: error.message })
        }
    },

    // Update Research Service
    updateResearchService: async (req, file, researchServiceId) => {
        try {
            let updateData = {
                ...req
            };    
            if (file) {
                const attachment = file.destination.replace('./public/', '/public/') + file.originalname;
                updateData.attachment = attachment;
            }
            await ResearchServices.update(updateData, { where: { id: researchServiceId } });

            // Fetch the updated speechOnDemand after the update
            const updatedResearchService = await ResearchServices.findOne({
                where: { id: researchServiceId },
            }, { raw: true });

            return updatedResearchService;

        } catch (error) {
            throw { message: error.message || "Error Updating research Service" };
        }
    },

    // Delete Research Service
    deleteResearchService: async (req) => {
        try {

            const updatedData = {
                isActive: "inactive"
            }

            await ResearchServices.update(updatedData, { where: { id: req } });

            // Fetch the updated speechOnDemand after the update
            const updatedResearchService = await ResearchServices.findByPk(req, { raw: true });

            return updatedResearchService;


        } catch (error) {
            throw { message: error.message || "Error deleting Research Service" };
        }
    }


}

module.exports = researchService