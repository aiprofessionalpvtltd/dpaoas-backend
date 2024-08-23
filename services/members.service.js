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

            let { memberName, memberUrduName, fkTenureId, fkParliamentaryYearId , memberStatus, politicalParty, electionType, gender, isMinister ,governmentType,phoneNo,reason, memberProvince} = req;

            const memberRequest = await members.create({
                memberName: memberName ? memberName : null,
                memberUrduName : memberUrduName ? memberUrduName : null,
                fkTenureId: fkTenureId ? fkTenureId : null,
                fkParliamentaryYearId: fkParliamentaryYearId ? fkParliamentaryYearId : null,
                memberStatus: memberStatus ? memberStatus : null,
                politicalParty: politicalParty ? politicalParty : null,
                electionType: electionType ? electionType : null,
                gender: gender ? gender : null,
                memberProvince: memberProvince ? memberProvince : null,
                isMinister: isMinister ? isMinister : null,
                governmentType: governmentType ? governmentType : null,
                phoneNo: phoneNo ? phoneNo :null,
                reason: reason ? reason : null,
            });
 
            return memberRequest;
        } catch (error) {
            console.error('Error creating member request:', error);
            throw error; // or handle the error in a way that makes sense for your application
        }
    },
    // Update A Member
    updateMember: async (id, payload) => {
        try {
            let { memberName, memberUrduName, fkTenureId, fkParliamentaryYearId , memberStatus, politicalParty, electionType, gender, isMinister,governmentType,phoneNo, memberProvince , reason} = payload;

            const result = await members.update(
                {
                    memberName: memberName ? memberName : null,
                    memberUrduName : memberUrduName ? memberUrduName : null,
                    fkTenureId: fkTenureId ? fkTenureId : null,
                    fkParliamentaryYearId: fkParliamentaryYearId ? fkParliamentaryYearId : null,
                    memberStatus: memberStatus ? memberStatus : null,
                    politicalParty: politicalParty ? politicalParty : null,
                    electionType: electionType ? electionType : null,
                    gender: gender ? gender : null,
                    isMinister: isMinister ? isMinister : null,
                    governmentType: governmentType ? governmentType : null,
                    phoneNo: phoneNo ? phoneNo :null,
                    memberProvince: memberProvince ? memberProvince : null,
                    reason: reason ? reason : null,
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