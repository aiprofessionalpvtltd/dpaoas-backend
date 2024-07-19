const db = require("../models");
const ContactTemplates = db.contactTemplates;
const Users = db.users;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');


const ContactTemplateService = {
    // Create A New ContactTemplate
    createContactTemplate: async (req) => {
        try {

            const contactTemplate = await ContactTemplates.create(req);

            return contactTemplate;
        } catch (error) {
            throw { message: error.message || "Error Creating ContactTemplate" };

        }
    },

    // Retrieve All ContactTemplates
    findAllContactTemplates: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await ContactTemplates.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['email', 'userStatus'],
                    },
                ],
            });

            console.log("rows: " + rows)

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, contactTemplate: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All ContactTemplates");
        }
    },

    // Retrieve Single contactTemplate
    findSinlgeContactTemplate: async (contactTemplateId) => {
        try {
            const contactTemplate = await ContactTemplates.findOne({
                where: { id: contactTemplateId },
                include: [
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['email', 'userStatus'],
                    },
                ],
            });
            if (!contactTemplate) {
                throw ({ message: "contactTemplate Not Found!" })
            }
            return contactTemplate;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single contactTemplate" };
        }
    },

    // Update contactTemplate
    updateContactTemplate: async (req, contactTemplateId) => {
        try {

            await ContactTemplates.update(req.body, { where: { id: contactTemplateId } });

            // Fetch the updated contactTemplate after the update
            const updatedContactTemplate = await ContactTemplates.findOne({
                where: { id: contactTemplateId }, 
                include: [
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['email', 'userStatus'],
                    },
                ],
            }, { raw: true });

            return updatedContactTemplate;

        } catch (error) {
            throw { message: error.message || "Error Updating ContactTemplate" };
        }
    },

      // Delete ContactTemplate
      deleteContactTemplate: async (req) => {
        try {

            const updatedData = {
                isActive: "false"
            }

            await ContactTemplates.update(updatedData, { where: { id: req } });

            // Fetch the updated ContactTemplate after the update
            const updatedContactTemplate = await ContactTemplates.findByPk(req, { raw: true });

            return updatedContactTemplate;


        } catch (error) {
            throw { message: error.message || "Error deleting ContactTemplate" };
        }
    }


}

module.exports = ContactTemplateService