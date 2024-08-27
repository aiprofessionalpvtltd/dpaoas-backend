const db = require("../models");
const members = db.members;
const tenures = db.tenures;
const politicalParties = db.politicalParties;
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const memberService = {
    // Create A New Member
    createMember: async (req) => {
        const transaction = await db.sequelize.transaction();
    
        try {
            let { memberName, memberUrduName, fkTenureId, fkParliamentaryYearId, memberStatus, politicalParty, electionType, gender, isMinister, governmentType, phoneNo, reason, memberProvince } = req;
    
            // Get the latest ID from the members table
            const latestMember = await members.findOne({
                order: [['id', 'DESC']],
                transaction
            });
    
            // Increment the latest ID by 1 for the new entry
            const newMemberId = latestMember ? latestMember.id + 1 : 1;
    
            // Create the new member entry
            const memberRequest = await members.create({
                id: newMemberId,
                memberName: memberName ? memberName : null,
                memberUrduName: memberUrduName ? memberUrduName : null,
                fkTenureId: fkTenureId ? fkTenureId : null,
                fkParliamentaryYearId: fkParliamentaryYearId ? fkParliamentaryYearId : null,
                memberStatus: memberStatus ? memberStatus : null,
                politicalParty: politicalParty ? politicalParty : null,
                electionType: electionType ? electionType : null,
                gender: gender ? gender : null,
                memberProvince: memberProvince ? memberProvince : null,
                isMinister: isMinister ? isMinister : null,
                governmentType: governmentType ? governmentType : null,
                phoneNo: phoneNo ? phoneNo : null,
                reason: reason ? reason : null,
            }, { transaction });
    
            await transaction.commit();
    
            return memberRequest;
        } catch (error) {
            await transaction.rollback();
            console.error('Error creating member request:', error);
            throw error; // Handle the error as needed
        }
    },
    
    // Update A Member
    updateMember: async (id, payload) => {
        try {
            // console.log(payload); return false;
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
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
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
    },

    promoteMembers: async (  newParliamentaryYearId, memberID) => {
        const transaction = await db.sequelize.transaction();
    
        try {
            // Fetch the specific member by memberID
            const member = await members.findOne({
                where: { id: memberID },
                transaction
            });
    
            if (!member) {
                throw new Error('Member not found');
            }
    
            // Update the status of the old member to false (inactive)
            await members.update(
                { status: false },
                {
                    where: { id: member.id },
                    transaction
                }
            );
    
            let { memberName, memberUrduName, fkTenureId, fkParliamentaryYearId, memberStatus, politicalParty, electionType, gender, isMinister, governmentType, phoneNo, reason, memberProvince } = member;

        // Get the latest ID from the members table
        const latestMember = await members.findOne({
            order: [['id', 'DESC']],
            transaction
        });

        // Increment the latest ID by 1 for the new entry
            const newMemberId = latestMember ? latestMember.id + 1 : 1;
            
            const memberData = {
                id: newMemberId,
                memberName: member.memberName,
                memberUrduName: member.memberUrduName,
                fkTenureId: member.fkTenureId,
                fkParliamentaryYearId: newParliamentaryYearId, // Set the new fkParliamentaryYearId
                memberStatus: member.memberStatus,
                politicalParty: member.politicalParty,
                electionType: member.electionType,
                gender: member.gender,
                memberProvince: member.memberProvince,
                isMinister: member.isMinister,
                governmentType: member.governmentType,
                phoneNo: member.phoneNo,
                reason: member.reason,
                status: true // Set the status of the new record to active (true)
            };

          
            // Create a new member record with the same data but a new fkParliamentaryYearId
            const newMember = await members.create(memberData, { transaction });
    
            await transaction.commit();
            console.log('Member promoted successfully');
            return newMember;
        } catch (error) {
            await transaction.rollback();
            console.error('Error promoting member:', error);
            throw error; // Handle the error as needed
        }
    },

      // Get Member By Parliamentary Year ID
      getMemberByParliamentaryYearID: async (id) => {
        try {

            const result = await members.findAll({
                raw: false,
                where: {
                    fkParliamentaryYearId: id
                },
                include: [
                    {
                        model: tenures, as: 'tenures',
                        attributes: ['id','tenureName']
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears',
                        attributes: ['id','parliamentaryTenure'],
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
    
}

module.exports = memberService