const db = require("../models");
const LegislativeBills = db.legislativeBills;
const Users = db.users;
const Sessions = db.sessions;
const BillStatuses = db.billStatuses;
const { Op } = require('sequelize');
const logger = require('../common/winston');
const moment = require('moment');

const legislativeBillService = {


    // Retrieve All LegislativeBills
    findAllLegislativeBills: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: { legislativeSentStatus: 'toLegislation' },
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: db.employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    // {
                    //     model: db.parliamentaryYearsMna,
                    //     as: 'mnaParliamentaryYears'
                    // },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    // {
                    //     model: db.tenuresMinister,
                    //     as: 'tenuresMinisters'
                    // },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['id','memberName'] // Include only the member name
                    },
                    {
                        model: db.legislationMovers,
                        as: 'legislationMovers',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'member',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassages',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocuments'
                    }
                ],
                distinct: true,
            });

            // Parse the files in the billDocuments if they exist
            if (rows.length > 0) {
                rows.forEach(bill => {
                    if (bill.billDocuments && bill.billDocuments.length > 0) {
                        bill.billDocuments.forEach(doc => {
                            if (doc.file) {
                                doc.file = doc.file.map(file => JSON.parse(file));
                            }
                        });
                    }
                });
            }

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, legislativeBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

    findAllLegislativeBillsInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: { legislativeSentStatus: 'inNotice' },
                offset,
                limit,
                order: [['createdAt', 'DESC']],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: db.employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    // {
                    //     model: db.parliamentaryYearsMna,
                    //     as: 'mnaParliamentaryYears'
                    // },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    // {
                    //     model: db.tenuresMinister,
                    //     as: 'tenuresMinisters'
                    // },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['id','memberName'] // Include only the member name
                    },
                    {
                        model: db.legislationMovers,
                        as: 'legislationMovers',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'member',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassages',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocuments'
                    }
                ],
                distinct: true,
            });

            // Parse the files in the billDocuments if they exist
            if (rows.length > 0) {
                rows.forEach(bill => {
                    if (bill.billDocuments && bill.billDocuments.length > 0) {
                        bill.billDocuments.forEach(doc => {
                            if (doc.file) {
                                doc.file = doc.file.map(file => JSON.parse(file));
                            }
                        });
                    }
                });
            }

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, legislativeBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

    // Retrieve Today's legislativeBills
    getTodaysLegislativeBills: async (currentPage, pageSize, currentDate, legislativeSentStatus) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: {
                    legislativeSentStatus: legislativeSentStatus,
                    createdAt: {
                        [Op.gte]: currentDate + " 00:00:00", // From start of the day
                        [Op.lte]: currentDate + " 23:59:59"  // Until the end of the day
                    }
                },
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: db.employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    // {
                    //     model: db.parliamentaryYearsMna,
                    //     as: 'mnaParliamentaryYears'
                    // },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    // {
                    //     model: db.tenuresMinister,
                    //     as: 'tenuresMinisters'
                    // },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['id','memberName'] // Include only the member name
                    },
                    {
                        model: db.legislationMovers,
                        as: 'legislationMovers',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'member',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassages',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocuments'
                    }
                ],
                offset,
                limit,
                order: [["id", "DESC"]],
                distinct: true,
            });

            // Parse the files in the billDocuments if they exist
            if (rows.length > 0) {
                rows.forEach(bill => {
                    if (bill.billDocuments && bill.billDocuments.length > 0) {
                        bill.billDocuments.forEach(doc => {
                            if (doc.file) {
                                doc.file = doc.file.map(file => JSON.parse(file));
                            }
                        });
                    }
                });
            }

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, legislativeBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Today's legislativeBills");
        }
    },


    // Create A New LegislativeBill
    createLegislativeBill: async (req) => {

        try {
            console.log("dsdsd", req); 
            
            const legislativeBill = await LegislativeBills.create(req);
            const legislativeBillId = legislativeBill?.id;
            console.log("legislativeBillId", legislativeBillId);
            logger.info('Creating new legislative bill', { legislativeBillId });
            

            if (Array.isArray(req.legislationMovers)) {

                for (const moverData of req.legislationMovers) {
                    const fkMemberId = moverData.fkMemberId;

                    // Determine the fkMemberId value
                    const fkMemberIdValue = moverData.fkMemberId ? moverData.fkMemberId : (req.web_id ? req.web_id : null);
                    // console.log("fkMemberIdValue=------", fkMemberIdValue)



                    // Prepare the data for legislationMovers table
                    const legislationMoversData = {
                        fklegislationBillId: legislativeBillId,
                        fkMemberId: fkMemberIdValue
                    };

                    const legislationMover = await db.legislationMovers.create(legislationMoversData);
                    // console.log("resolutionMover------", resolutionMover)

                }
            } else {
                // Handle the case when legislationMovers does not exist
                const fkMemberIdValue = req.web_id ? req.web_id : null;
                // console.log("fkMemberIdValue when legislationMovers is not present=------", fkMemberIdValue);

                // If fkMemberIdValue is not null, create a resolution mover entry
                if (fkMemberIdValue !== null) {
                    const legislationMoversData = {
                        fklegislationBillId: legislativeBillId,
                        fkMemberId: fkMemberIdValue
                    };

                    const legislationMover = await db.legislationMovers.create(legislationMoversData);
                    console.log("legislationMover when legislationMovers is not present------", legislationMover);
                } else {
                    console.log("No fkMemberId or web_id provided for legislationMover.");
                }
            }

            return legislativeBill;
        } catch (error) {
            throw { message: error.message || "Error Creating legislative Bill" };
        }
    },

    // Send To Legislation
    sendToLegislation: async (req, billId) => {
        try {
            const updatedData = {
                legislativeSentStatus: "toLegislation",
                legislativeSentDate: req.legislativeSentDate
            }
            await LegislativeBills.update(updatedData, { where: { id: billId } });

            // Fetch the updated private member bill which is sent to legislation
            const billData = await LegislativeBills.findOne({ where: { id: billId } });
            return billData;
        } catch (error) {
            throw { message: error.message || "Error Sending Legislative Bill To Legislation!" };
        }
    },

    generateDiaryNumber: async () => {
        try {
            // Determine the current session year
            const currentDate = moment();
            const currentYear = currentDate.year();
            const sessionStartDate = moment(`${currentYear}-03-12`);
            const nextYear = currentYear + 1;
            const sessionEndDate = moment(`${nextYear}-03-11`);

            // Fetch the latest legislative bill
            const latestBill = await LegislativeBills.findOne({
                order: [["createdAt", "DESC"]],
            });

            let newDiaryNumber;

            if (latestBill) {
                const currentDateMoment = moment(currentDate, 'YYYY-MM-DD');
                const sessionEndDateMoment = moment(sessionEndDate, 'YYYY-MM-DD').startOf('day'); // Make sure it's in 'day' precision

                console.log('sessionEndDate', sessionEndDateMoment);
                console.log('currentDateMoment', currentDateMoment);

                // Check if the latest diary date is after the session end date
                if (currentDateMoment.isAfter(sessionEndDateMoment, 'day')) {
                    // If diary number is after sessionEndDate, start from "01"
                    newDiaryNumber = `01`;
                } else {
                    // If diary number is on or before sessionEndDate, increment the number
                    const lastDiaryNumberValue = parseInt(latestBill.diary_number, 10);
                    newDiaryNumber = String(lastDiaryNumberValue + 1).padStart(2, '0');
                }
            } else {
                // If no diary number is found, start from "01"
                newDiaryNumber = `01`;
            }

            console.log('newDiaryNumber', newDiaryNumber);

            const result = {
                newDiaryNumber: newDiaryNumber, // Include the new newDiaryNumber
            };

            return result;
        } catch (error) {
            throw { message: error.message || "Error Generating Diary Number!" };
        }
    }
    ,

    findSingleLegislativeBill: async (legislativeBillId) => {
        try {
            // Fetch the legislative bill
            const legislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
                order: [['id', 'ASC']],
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: db.employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    // {
                    //     model: db.parliamentaryYearsMna,
                    //     as: 'mnaParliamentaryYears'
                    // },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    // {
                    //     model: db.tenuresMinister,
                    //     as: 'tenuresMinisters'
                    // },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.legislationMovers,
                        as: 'legislationMovers',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'member',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassages',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocuments'
                    }
                ],
            });

            if (!legislativeBill) {
                throw ({ message: "Legislative Bill Not Found!" });
            }

            // Check if the legislative bill already has a diary number
            if (!legislativeBill.diary_number) {
                // Generate the new diary number
                const newDiaryNumber = await module.exports.generateDiaryNumber();
                legislativeBill.diary_number = newDiaryNumber;
                // await legislativeBill.save(); // Save the new diary number to the database
            }

            return legislativeBill;
        } catch (error) {
            throw { message: error.message || "Error Fetching Single Legislative Bill" };
        }
    },

    // Retrieve all LegislativeBill by web_id
    findAllLegislativeBillsByWebId: async (webId) => {
        try {
            const legislativeBill = await LegislativeBills.findAll({
                where: { web_id: webId },
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: db.employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: db.parliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    // {
                    //     model: db.parliamentaryYearsMna,
                    //     as: 'mnaParliamentaryYears'
                    // },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    // {
                    //     model: db.tenuresMinister,
                    //     as: 'tenuresMinisters'
                    // },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'session',
                        attributes: ['id', 'sessionName']
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: db.members,
                        as: 'member',
                        attributes: ['id','memberName'] // Include only the member name
                    },
                    {
                        model: db.legislationMovers,
                        as: 'legislationMovers',
                        attributes: ['id', 'fkMemberId'],
                        include: [
                            {
                                model: db.members,
                                as: 'member',
                                attributes: ['id', 'memberName']
                            }
                        ]
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassages',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocuments'
                    }
                ],
                order: [['id', 'DESC']],
                distinct: true,
            });

            // Parse the files in the billDocuments if they exist
            if (legislativeBill.length > 0) {
                legislativeBill.forEach(bill => {
                    if (bill.billDocuments && bill.billDocuments.length > 0) {
                        bill.billDocuments.forEach(doc => {
                            if (doc.file) {
                                doc.file = doc.file.map(file => JSON.parse(file));
                            }
                        });
                    }
                });
            }

            if (!legislativeBill) {
                throw ({ message: "legislative Bill Not Found!" })
            }
            return legislativeBill;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching legislative Bill by web_id" };
        }
    },

    // Update LegislativeBill
    updateLegislativeBill: async (legislativeBillId, req) => {
        try {
            // Check if diary_number is provided in the request body
            if (req.body.diary_number) {
                // Check for duplicate diary_number
                const duplicateDiaryNumber = await LegislativeBills.findOne({
                    where: {
                        diary_number: req.body.diary_number,
                        id: { [Op.ne]: legislativeBillId } // Exclude current legislative bill
                    }
                });

                if (duplicateDiaryNumber) {
                    throw { message: "Duplicate diary number exists!" };
                }
            }

            if (req.body.legislationMovers) {
                // Delete existing resolutionMovers entries
                await db.legislationMovers.destroy({
                    where: { fklegislationBillId: legislativeBillId }
                });

                // Create new resolutionMovers entries
                for (const moverData of req.body.legislationMovers) {
                    const { fkMemberId } = moverData;

                    const legislationMoverData = {
                        fklegislationBillId: legislativeBillId,
                        fkMemberId: fkMemberId
                    };

                    await db.legislationMovers.create(legislationMoverData);
                }
            }

            // Update the legislative bill
            await LegislativeBills.update(req.body, { where: { id: legislativeBillId } });

            const updatedLegislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
            }, { raw: true });

            return updatedLegislativeBill;
        } catch (error) {
            throw { message: error.message || 'Error updating LegislativeBill' };
        }
    },


    // Delete LegislativeBill
    deleteLegislativeBill: async (req) => {
        try {
            const updatedData = {
                isActive: "inactive"
            }

            await LegislativeBills.update(updatedData, { where: { id: req } });

            const updatedLegislativeBill = await LegislativeBills.findByPk(req, { raw: true });

            return updatedLegislativeBill;

        } catch (error) {
            throw { message: error.message || "Error deleting Legislative Bill" };
        }
    }






}

module.exports = legislativeBillService