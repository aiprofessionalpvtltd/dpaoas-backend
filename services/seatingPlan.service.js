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
                        assignStatus: seatData.assignStatus
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
                        rowNumber: seatData.rowNumber
                    });
                    return newSeat;
                }
            }
        } catch (error) {
            throw { message: error.message || 'Error assigning/un-assigning seat.' };
        }
    },

    // Retrieve All Seats Details
    getAllSeatDetails: async () => {
        try {
            // Fetch all seat details including member details
            const seatDetails = await SeatingPlan.findAll({
                include: [
                    {
                        model: Members,
                        attributes: ['id', 'memberName', 'memberUrduName', 'governmentType']
                    }
                ],
            });
            // Initialize seat structure with continuous seat numbering
            const rows = ['A', 'B', 'C', 'D', 'E', 'F'];
            const seatsPerRow = 18;
            let currentSeatNumber = 1;
            const seatStructure = {};

            rows.forEach(row => {
                seatStructure[row] = [];
                for (let i = 0; i < seatsPerRow; i++) {
                    seatStructure[row].push({
                        rowNumber: row,
                        seatNumber: currentSeatNumber++,
                        member: null,
                    });
                }
            });

            // Populate seatStructure with seat details from the database
            seatDetails.forEach(detail => {
                const { rowNumber, seatNumber } = detail;
                const member = detail.member ? {
                    id: detail.member.id,
                    memberName: detail.member.memberName,
                    memberUrduName: detail.member.memberUrduName,
                    governmentType: detail.member.governmentType,
                } : null;

                // Find the correct seat by seatNumber and assign the member details
                const seat = Object.values(seatStructure).flat().find(s => s.seatNumber === seatNumber);
                if (seat) {
                    seat.member = member;
                }
            });
            // Convert seatStructure to the desired output format
            const output = Object.entries(seatStructure).reduce((acc, [row, seats]) => {
                seats.forEach(seat => {
                    if (seat.member && seat.member.governmentType === 'Opposition') {
                        acc.Opposition.push(seat);
                    } else if (seat.member && seat.member.governmentType === 'Government') {
                        acc.Government.push(seat);
                    } else {
                        // Determine seat category based on its position within the row
                        const type = seat.seatNumber % seatsPerRow <= 9 && seat.seatNumber % seatsPerRow > 0 ? 'Government' : 'Opposition';
                        acc[type].push(seat);
                    }
                });
                return acc;
            }, { Government: [], Opposition: [] });
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