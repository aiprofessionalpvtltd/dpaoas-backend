const membersService = require("../services/members.service")
const logger = require('../common/winston');
const { uploadFile } = require('../common/upload')
const db = require("../models");
const members = db.members;
const tenures = db.tenures;
const politicalParties = db.politicalParties;

const membersController = {
   
    // Creates A New Member
    createMember: async (req, res) => {
        try {
            const { body } = req
            // const { file } = req.body
            logger.info(`membersController: createMember body ${JSON.stringify(body)}`)
            const result = await membersService.createMember(body);
            logger.info('Member Request submitted Successfully!');
            return res.status(201).send({
                success: true,
                message: `Member Request submitted successfully`,
                data: result.dataValues,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,

            })
        }
    },

     // Members Listing
     getAllMembers: async (req, res) => {
        const { query } = req
        const { currentPage, pageSize } = query
        const offset = currentPage * pageSize;
        const limit = pageSize;
        logger.info(`membersController: getAllMembers query ${JSON.stringify(query)}`)
      //  const order = [['id', 'DESC']]; // Use defaultSortColumn if orderType is undefined
        let options = {
            raw: false,
            include: [
                {
                    model: tenures,
                    as: 'tenures',
                    // where: employeeWhere,
                    attributes: ['tenureName'],
                },
                {
                    model: politicalParties,
                    as: 'politicalParties',
                    attributes: ['partyName'],
                }
            ],
            subQuery: false,
            distinct: true,
            limit,
            offset,

            order: [['id', 'DESC']],

        }
        let whereClause = {};
       // whereClause.memberStatus = 'Active';
        // if (page && pageSize) {
        //     options = {
        //         ...options,
        //         limit: parseInt(pageSize),
        //         offset,
        //     };
        // }

        // options.order = order;
        //options.where = whereClause;
        const { rows, count } = await members.findAndCountAll(options);
        const totalPages = Math.ceil(count / pageSize)
        return res.status(200).send({
            success: true,
            message: `All members Information fetched successfully`,
            data: { members:rows, totalPages, count },
        })
    },

    getMemberById: async (req, res) => {
        const { params } = req
        const { id } = params
        logger.info(`membersController: getMemberById ${id}`)
        const memberRecord = await membersService.getMemberById(id)

        return res.status(200).send({
            success: true,
            message: `Member fetched successfully for id ${id}`,
            data: memberRecord,
        })
    },
    // Update Member
    updateMember: async (req, res) => {
        try {
            const { body, params } = req
            const { id } = params
            logger.info(
                `membersController: updateMemberRequest id ${id} and body ${JSON.stringify(
                    body,
                )}`,
            )
            const result = await membersService.updateMember(id, body);
            if (result) {
                logger.info('Member Request Updated Successfully!');
                return res.status(201).send({
                    success: true,
                    message: `Member Request Updated successfully`,
                    data: { ...body },
                })
            } else {
                return res.status(400).send({
                    success: false,
                    message: 'No rows were updated. Check if the record with the provided ID exists',
                });
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message,
            })
        }
    },

    // Delete Member
    deleteMember: async(req,res) =>
    {
        try{
            logger.info(`membersController: deleteMember id ${JSON.stringify(req.params.id)}`)
            const memberId = req.params.id;
            const member = await members.findByPk(memberId);
            if (!member)
            {
                return res.status(200).send({
                    success: true,
                    message: "Member Not Found!",
                })
            }
        const deletedMember = await membersService.deleteMember(memberId);
        logger.info("Member Deleted Successfully!")
        return res.status(200).send({
          success: true,
          message: "Member Deleted Successfully!",
          data: deletedMember,
          })
      } catch (error) {
        logger.error(error.message)
        return res.status(400).send({
          success: false,
          message: error.message
          })
      }

    },

   

}
module.exports = membersController;

