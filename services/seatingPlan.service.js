const db = require("../models");
const ManageSessions = db.manageSessions;
const Sessions = db.sessions
const SessionAttendance = db.sessionAttendances
const Members = db.members
const SeatingPlan = db.seatingPlans
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const seatingPlanService = {

    //Assign/UnAssign Member's Seat
    updateSeatAssignment: async (seatData, seatNumber, existingSeat) => {
        try {
            if (existingSeat) {
                if (seatData.fkMemberId !== null) {
                    // Check if the member is already assigned to another seat
                    const memberAssignedToAnotherSeat = await SeatingPlan.findOne({
                        where: {
                            fkMemberId: seatData.fkMemberId,
                            id: { [db.Sequelize.Op.not]: existingSeat.dataValues.id } // Exclude the current seat from the check
                        }
                    });
                    if (memberAssignedToAnotherSeat) {
                        throw { message: 'Member is already assigned to another seat.' };
                    }
                }
                // If the seat exists, update the existing entry
                await SeatingPlan.update(
                    {
                        fkMemberId: seatData.fkMemberId !== null ? seatData.fkMemberId : null,
                        assignStatus: seatData.assignStatus,
                        isRequest: seatData?.isRequest === true // Add isRequest to the update
                    },
                    {
                        where: { id: existingSeat.dataValues.id },
                        returning: true,
                        individualHooks: true
                    },
                );
                const updatedSeat = await SeatingPlan.findOne({
                    where: { seatNumber: seatNumber }
                });
                return updatedSeat; 
            } else {
                // Check if the member is already assigned to another seat
                const memberAssignedToAnotherSeat = await SeatingPlan.findOne({
                    where: { fkMemberId: seatData.fkMemberId }
                });
    
                if (memberAssignedToAnotherSeat) {
                    throw { message: 'Member is already assigned to another seat.' };
                } else {
                    // If the seat doesn't exist and member is not assigned to another seat, create a new entry
                    const newSeat = await SeatingPlan.create({
                        seatNumber: seatNumber,
                        fkMemberId: seatData.fkMemberId !== null ? seatData.fkMemberId : null,
                        assignStatus: seatData.assignStatus,
                        rowNumber: seatData.rowNumber,
                        isRequest: seatData?.isRequest === true // Add isRequest to the creation
                    });
                    return newSeat;
                }
            }
        } catch (error) {
            throw { message: error.message || 'Error assigning/un-assigning seat.' };
        }
    },    

    swapSeats: async (seatNumber1, seatNumber2) => {
        try {
          // Fetch seat details by seat number
          const seat1 = await SeatingPlan.findOne({ where: { seatNumber: seatNumber1 } });
          const seat2 = await SeatingPlan.findOne({ where: { seatNumber: seatNumber2 } });
    
          if (!seat1 || !seat2) {
            throw { message: "One or both seats not found." };
          }
    
          // Swap member assignments between the two seats
          const member1 = seat1?.fkMemberId;
          const member2 = seat2?.fkMemberId;
    
          await SeatingPlan.update(
            { fkMemberId: member2 },
            { where: { seatNumber: seatNumber1 } }
          );
    
          await SeatingPlan.update(
            { fkMemberId: member1 },
            { where: { seatNumber: seatNumber2 } }
          );
    
          return { success: true, message: "Seats swapped successfully." };
        } catch (error) {
          throw { message: error.message || "Error swapping seats." };
        }
      },

      placeSeat: async (fromItem, toItem) => {
        try {    
            // Fetch toItem from the database
            const seatTo = await SeatingPlan.findOne({ where: { seatNumber: toItem.seatNumber } });
    
            if (!seatTo) {
                throw { message: "To seat not found." };
            }
    
            // Update toItem with fromItem member
            await SeatingPlan.update(
                { fkMemberId: fromItem.member.id },
                { where: { seatNumber: toItem.seatNumber } }
            );
    
            // Remove member from fromItem seat
            await SeatingPlan.update(
                { fkMemberId: null },
                { where: { seatNumber: fromItem.seatNumber } }
            );
    
            return { success: true, message: "Member placed successfully." };
        } catch (error) {
            throw { message: error.message || "Error placing member." };
        }
    },    

    getAllSeatDetails: async () => {
        try {
            // Fetch all seat details including member details
            const seatDetails = await SeatingPlan.findAll({
                include: [
                    {
                        model: Members,
                        attributes: ['id', 'memberName', 'memberUrduName', 'governmentType', 'isMinister']
                    }
                ],
            });
    
            // Initialize seat structure with continuous seat numbering
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
            const seatsPerRow = 18;
            const seatStructure = {};
    
            rows.forEach(row => {
                seatStructure[row] = [];
                let currentSeatNumber = row === 'A' ? 2 : 20 + (rows.indexOf(row) - 1) * seatsPerRow; // Skip seat number 1 for row A
                for (let i = 0; i < seatsPerRow; i++) {
                    seatStructure[row].push({
                        rowNumber: row,
                        seatNumber: currentSeatNumber,
                        member: null,
                    });
                    currentSeatNumber++;
                }
            });
    
            // Populate seatStructure with seat details from the database
            seatDetails.forEach(detail => {
                const { rowNumber, seatNumber, isRequest } = detail;
                const member = detail.member ? {
                    id: detail.member.id,
                    memberName: detail.member.memberName,
                    memberUrduName: detail.member.memberUrduName,
                    governmentType: detail.member.governmentType,
                    isMinister: detail.member.isMinister,
                } : null;
    
                // Find the correct seat by seatNumber and assign the member details
                const seat = seatStructure[rowNumber].find(s => s.seatNumber === seatNumber);
                if (seat) {
                    seat.member = member;
                    seat.isRequest = isRequest; // Add isRequest property
                }
            });
    
            // Convert seatStructure to the desired output format
            const output = { Government: [], Opposition: [] };
    
            rows.forEach(row => {
                const rowSeats = seatStructure[row];
                const half = Math.ceil(rowSeats.length / 2);
                const govSeats = rowSeats.slice(0, half).reverse(); // Right to left for the first half
                const oppSeats = rowSeats.slice(half).reverse(); // Right to left for the second half
    
                govSeats.forEach(seat => output.Government.push(seat));
                oppSeats.forEach(seat => output.Opposition.push(seat));
            });
    
            return output;
        } catch (error) {
            throw ({ message: error.message || "Error Retrieving Seat Details!" });
        }
    },
    
    // Retrive Seat Details
    getSeatDetails: async (seatNumber) => {
        try {
            const seatDetails = await SeatingPlan.findOne({
                where: { seatNumber: seatNumber },
                include: [
                    {
                        model: Members,
                        attributes: ['id', 'memberName', 'memberUrduName', 'governmentType']
                    }
                ],
            })

            if (!seatDetails) {
                throw ({ message: "Single Seat Details Not Found!" })
            }
            return seatDetails
        } catch (error) {
            throw ({ message: error.message || "Error Retrieving Single Seat Details!" })
        }
    },


}

module.exports = seatingPlanService;