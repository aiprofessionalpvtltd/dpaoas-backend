const db = require("../models");
const members = db.members;
const tenures = db.tenures;
const politicalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const memberService = {
    // Create A New Member
    createMember: async (req) => {
        try {
            let { memberName, memberUrduName, fkTenureId, memberStatus, politicalParty, electionType, gender, isMinister ,governmentType,phoneNo} = req;

            const memberRequest = await members.create({

                memberName,
                memberUrduName,
                fkTenureId,
                memberStatus,
                politicalParty,
                electionType,
                gender,
                isMinister,
                governmentType,
                phoneNo
            });

            return memberRequest;
        } catch (error) {
            console.error('Error creating leave request:', error);
            throw error; // or handle the error in a way that makes sense for your application
        }
    },
    // Update A Member
    updateMember: async (id, payload) => {
        try {
            let { memberName, memberUrduName, fkTenureId, memberStatus, politicalParty, electionType, gender, isMinister,governmentType,phoneNo } = payload;

            const result = await members.update(
                {
                    memberName,
                    governmentType,
                    memberUrduName,
                    fkTenureId,
                    memberStatus,
                    politicalParty,
                    electionType,
                    gender,
                    isMinister,
                    phoneNo
                },
                {
                    where: { id: id } // Add the WHERE condition to filter by id
                }
            );
            if (result > 0) {
                return result;
            } else {
                console.log('No rows were updated. Check if the record with the provided ID exists')
            }
        } catch (error) {
            console.error('Error updating leave request:', error.message);
        }
    },
    // Get Member by ID
    getMemberById: async (id) => {
        try {

            const result = await members.findOne({
                raw: false,
                where: {
                    id: id
                },
                include: [
                    {
                        model: tenures, as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: politicalParties,
                        as: 'politicalParties',
                        attributes: ['id','partyName'],
                    }
                ],
            });

            return result
        } catch (error) {
            console.error('Error Fetching Member request:', error.message);
        }
    },
  
    //Delete Member
    deleteMember: async (memberId) => {
        try {
            const updatedData =
            {
                memberStatus: 'Tenure Completed'
            }
            await members.update(updatedData, { where: { id: memberId } });
            // Fetch the updated division after the update
            const deletedMember = await members.findOne({ where: { id: memberId } });
            return deletedMember;
        } catch (error) {
            throw { message: error.message || "Error Deleting Member!" };
        }
    }
}

module.exports = memberService