const membersService = require("../services/members.service");
const logger = require("../common/winston");
const { uploadFile } = require("../common/upload");
const db = require("../models");
const members = db.members;
const tenures = db.tenures;
const politicalParties = db.politicalParties;

const membersController = {
  // Creates A New Member
  createMember: async (req, res) => {
    try {
      const { body } = req;
      // const { file } = req.body
      logger.info(
        `membersController: createMember body ${JSON.stringify(body)}`
      );
      const result = await membersService.createMember(body);
      logger.info("Member Request submitted Successfully!");
      return res.status(201).send({
        success: true,
        message: `Member Request submitted successfully`,
        data: result.dataValues,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Members Listing
  getAllMembers: async (req, res) => {
    try {
        const { query } = req;
        const { currentPage = 1, pageSize = 10 } = query; // Set default values if not provided
        const offset = currentPage  * pageSize;
        const limit = parseInt(pageSize);

        logger.info(`membersController: getAllMembers query ${JSON.stringify(query)}`);

        // Define the where clause with status == true
        let whereClause = { status: true };

        // Define options for the query
        let options = {
            raw: false,
            include: [
                {
                    model: tenures,
                    as: "tenures",
                    attributes: ["tenureName"],
                },
                {
                    model: db.parliamentaryYears,
                    as: "parliamentaryYears",
                    attributes: ["id", "parliamentaryTenure"],
                },
                {
                    model: politicalParties,
                    as: "politicalParties",
                    attributes: ["partyName"],
                },
            ],
            subQuery: false,
            distinct: true,
            where: whereClause, // Apply the where clause here
            limit,
            offset,
            order: [["id", "DESC"]],
        };

        // Execute the query with the defined options
        const { rows, count } = await members.findAndCountAll(options);
        const totalPages = Math.ceil(count / pageSize);

        return res.status(200).send({
            success: true,
            message: `All members' information fetched successfully`,
            data: { members: rows, totalPages, count },
        });
    } catch (error) {
        console.error('Error fetching members:', error);
        return res.status(500).send({
            success: false,
            message: 'Failed to fetch members',
            error: error.message,
        });
    }
},

  getMemberById: async (req, res) => {
    const { params } = req;
    const { id } = params;
    logger.info(`membersController: getMemberById ${id}`);
    const memberRecord = await membersService.getMemberById(id);

    return res.status(200).send({
      success: true,
      message: `Member fetched successfully for id ${id}`,
      data: memberRecord,
    });
  },
  // Update Member
  updateMember: async (req, res) => {
    try {
      const { body, params } = req;
      const { id } = params;
      logger.info(
        `membersController: updateMemberRequest id ${id} and body ${JSON.stringify(
          body
        )}`
      );
      // console.log(body); return false;

      const result = await membersService.updateMember(id, body);
      if (result) {
        logger.info("Member Request Updated Successfully!");
        return res.status(201).send({
          success: true,
          message: `Member Request Updated successfully`,
          data: { ...body },
        });
      } else {
        return res.status(400).send({
          success: false,
          message:
            "No rows were updated. Check if the record with the provided ID exists",
        });
      }
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  // Delete Member
  deleteMember: async (req, res) => {
    try {
      logger.info(
        `membersController: deleteMember id ${JSON.stringify(req.params.id)}`
      );
      const memberId = req.params.id;
      const member = await members.findByPk(memberId);
      if (!member) {
        return res.status(200).send({
          success: true,
          message: "Member Not Found!",
        });
      }
      const deletedMember = await membersService.deleteMember(memberId);
      logger.info("Member Deleted Successfully!");
      return res.status(200).send({
        success: true,
        message: "Member Deleted Successfully!",
        data: deletedMember,
      });
    } catch (error) {
      logger.error(error.message);
      return res.status(400).send({
        success: false,
        message: error.message,
      });
    }
  },

  promoteMembers: async (req, res) => {
    try {
      const { body, params } = req;
      const { memberID } = params;
      const { newParliamentaryYearId } = body;

      logger.info(`membersController: promoteMembers for memberID ${memberID}`);

      // Call the promoteMembers service with memberID and newParliamentaryYearId
      const memberRecord = await membersService.promoteMembers(
        newParliamentaryYearId,
        memberID
      );

      return res.status(200).send({
        success: true,
        message: `Member promoted successfully for ID ${memberID}`,
        data: memberRecord,
      });
    } catch (error) {
      console.error("Error promoting member:", error);
      return res.status(500).send({
        success: false,
        message: `Failed to promote member for ID`,
        error: error.message,
      });
    }
  },
};
module.exports = membersController;
