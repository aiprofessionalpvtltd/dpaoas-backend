const db = require("../models");
const LegislativeBills = db.legislativeBills;
const Users = db.users;
const Sessions = db.sessions;
const BillStatuses = db.billStatuses;
const { Op } = require('sequelize');
const logger = require('../common/winston');
const moment = require('moment');

// Helper functions to get latest records
const getLatestRecords = async () => {
    const latestParliamentaryYear = await db.parliamentaryYears.findOne({
        order: [['id', 'DESC']]
    });

    const latestTenure = await db.tenures.findOne({
        order: [['id', 'DESC']]
    });

    const latestTerm = await db.terms.findOne({
        order: [['id', 'DESC']]
    });

    return {
        latestParliamentaryYear,
        latestTenure,
        latestTerm
    };
};

const legislativeBillService = {


    // Retrieve All LegislativeBills
    findAllLegislativeBills: async (currentPage, pageSize, legislativeSentStatus) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const latestRecords = await getLatestRecords();    
            
            const whereClause = {};
            if (legislativeSentStatus) {
                whereClause.legislativeSentStatus = legislativeSentStatus;
            }

            const { count, rows } = await LegislativeBills.findAndCountAll({
                where: whereClause,
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
                        as: 'introducedInHousesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassagesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocumentsLegis'
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

            if (latestRecords) {            
                // Force update Term and related data
                if (latestRecords.latestTerm) {
                    rows.fkTermId = latestRecords.latestTerm.id;
                    rows.terms = {...latestRecords.latestTerm};
                }
            
                // Force update Parliamentary Year and related data
                if (latestRecords.latestParliamentaryYear) {
                    rows.fkParliamentaryYearId = latestRecords.latestParliamentaryYear.id;
                    rows.parliamentaryYears = {...latestRecords.latestParliamentaryYear};
                }
            
                // Force update Tenure and related data
                if (latestRecords.latestTenure) {
                    rows.fkTenureId = latestRecords.latestTenure.id;
                    rows.tenures = {...latestRecords.latestTenure};
                }
            
            }

            return { 
                count, 
                totalPages, 
                legislativeBills: rows,
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All contactList");
        }
    },

    findAllLegislativeBillsInNotice: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const latestRecords = await getLatestRecords();

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
                        as: 'billDocumentsLegis'
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

            return { 
                count, 
                totalPages, 
                legislativeBills: rows,
                latestParliamentaryYear: latestRecords.latestParliamentaryYear,
                latestTenure: latestRecords.latestTenure,
                latestTerm: latestRecords.latestTerm
            };
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
                        as: 'billDocumentsLegis'
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
            const legislativeBill = await LegislativeBills.create(req);
            const legislativeBillId = legislativeBill?.id;            

            if (Array.isArray(req.legislationMovers)) {

                for (const moverData of req.legislationMovers) {
                    const fkMemberId = moverData.fkMemberId;

                    // Determine the fkMemberId value
                    const fkMemberIdValue = moverData.fkMemberId ? moverData.fkMemberId : (req.web_id ? req.web_id : null);



                    // Prepare the data for legislationMovers table
                    const legislationMoversData = {
                        fklegislationBillId: legislativeBillId,
                        fkMemberId: fkMemberIdValue
                    };

                    const legislationMover = await db.legislationMovers.create(legislationMoversData);

                }
            } else {
                // Handle the case when legislationMovers does not exist
                const fkMemberIdValue = req.web_id ? req.web_id : null;

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
            const latestRecords = await getLatestRecords();
    
            // Fetch the legislative bill
            const legislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
                attributes: {
                    include: [
                        'id',
                        'diary_number',
                        'noticeOfficeDiaryTime',
                        'noticeDate',
                        'fkSessionNo'
                    ]
                },
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
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
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
                        as: 'introducedInHousesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassagesLegis'
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocumentsLegis',
                    }
                ],
            });

            // Get the recommendation ID
            const recommendationId = legislativeBill?.introducedInHousesLegis?.fkManageCommitteeRecomendationId;
            let recommendation;
            // If there's a recommendation ID, fetch the full recommendation data
            if (recommendationId) {
                recommendation = await db.manageCommitteeRecomendations.findByPk(recommendationId, {
                    raw: true, // Add this to get plain object
                    attributes: ['id', 'committeeRecomendation', 'committeeStatus', 'createdAt', 'updatedAt']
                });
                if (recommendation && legislativeBill.introducedInHousesLegis) {
                    legislativeBill.introducedInHousesLegis.manageCommitteeRecomendations = recommendation;
                }
            }

            console.log("Recommendation data:", recommendation);

            console.log("legislativeBill", legislativeBill?.introducedInHousesLegis);
            
    
            if (!legislativeBill) {
                throw ({ message: "Legislative Bill Not Found!" });
            }
            console.log("doc.file", legislativeBill?.billDocumentsLegis);
            
            // Parse the files in the billDocuments
            if (legislativeBill.billDocumentsLegis && legislativeBill.billDocumentsLegis.length > 0) {
                legislativeBill.billDocumentsLegis.forEach(doc => {
                    
                    if (doc.file) {
                        doc.file = doc.file.map(file => JSON.parse(file));
                    }
                });
            }
    
            // Check if the legislative bill already has a diary number
            if (!legislativeBill.diary_number) {
                const newDiaryNumber = await module.exports.generateDiaryNumber();
                legislativeBill.diary_number = newDiaryNumber;
            }
    
            if (latestRecords) {
                if (latestRecords.latestTerm) {
                    legislativeBill.fkTermId = latestRecords.latestTerm.id;
                    legislativeBill.terms = { ...latestRecords.latestTerm };
                }
                if (latestRecords.latestParliamentaryYear) {
                    legislativeBill.fkParliamentaryYearId = latestRecords.latestParliamentaryYear.id;
                    legislativeBill.parliamentaryYears = { ...latestRecords.latestParliamentaryYear };
                }
                if (latestRecords.latestTenure) {
                    legislativeBill.fkTenureId = latestRecords.latestTenure.id;
                    legislativeBill.tenures = { ...latestRecords.latestTenure };
                }
    
                await legislativeBill.save();
            }
    
            return {
                legislativeBill,
                recommendation
            };
        } catch (error) {
            throw { message: error.message || "Error Fetching Single Legislative Bill" };
        }
    },       

    // Retrieve all LegislativeBill by web_id
    findAllLegislativeBillsByWebId: async (webId) => {
        try {
            const latestRecords = await getLatestRecords();
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
                        as: 'introducedInHousesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassagesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    },
                    {
                        model: db.billDocuments,
                        as: 'billDocumentsLegis'
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
            return {
                legislativeBills: legislativeBill,
                latestParliamentaryYear: latestRecords.latestParliamentaryYear,
                latestTenure: latestRecords.latestTenure,
                latestTerm: latestRecords.latestTerm
            };
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

            // Handle bill documents
            if (req.files && req.files.length > 0 && req.body.documentType) {
                const newDocumentObjects = req.files.map(file => {
                    const path = file.destination.replace('./public/', '/assets/') + file.originalname;
                    return JSON.stringify({ path });
                });

                // Create new bill document
                await db.billDocuments.create({
                    fkLegisBillDocumentId: legislativeBillId,
                    documentType: req.body.documentType,
                    documentDate: req.body.documentDate || new Date(),
                    documentDiscription: req.body.documentDiscription,
                    file: newDocumentObjects
                });
            }

            // Handle introducedInHouses data
            if (req.body) {
                const introducedData = {
                    fkLegisIntroducedInHouseId: legislativeBillId,
                    fkManageCommitteeId: req.body.fkManageCommitteeId,
                    introducedInHouseDate: req.body.introducedInHouseDate,
                    referedOnDate: req.body.referedOnDate,
                    fkManageCommitteeRecomendationId: req.body.fkManageCommitteeRecomendationId,
                    reportPresentationDate: req.body.reportPresentationDate,
                };

                console.log("introducedData", introducedData);
                

                await db.introducedInHouses.upsert({
                    ...introducedData,
                    where: { fkLegisIntroducedInHouseId: legislativeBillId }
                });
            }

            // Handle memberPassages data
            if (req.body) {
                const passageData = {
                    fkLegisMemberPassageId: legislativeBillId,
                    // fkSessionMemberPassageId: req.body.fkSessionMemberPassageId,
                    // memeberStatus: req.body.memeberStatus,
                    memeberNoticeDate: req.body.memeberNoticeDate,
                    dateOfConsiderationBill: req.body.dateOfConsiderationBill,
                    dateofWithDrawalrule115: req.body.dateofWithDrawalrule115
                };

                console.log("passageData", passageData);
                await db.memberPassages.upsert({
                    ...passageData,
                    where: { fkLegisMemberPassageId: legislativeBillId }
                });
            }

            // Update the legislative bill
            await LegislativeBills.update(req.body, { where: { id: legislativeBillId } });

            // Fetch updated record with associations
            const updatedLegislativeBill = await LegislativeBills.findOne({
                where: { id: legislativeBillId },
                include: [
                    {
                        model: db.billDocuments,
                        as: 'billDocumentsLegis'
                    },
                    {
                        model: db.introducedInHouses,
                        as: 'introducedInHousesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: db.manageCommittees, as: 'manageCommittees' },
                            { model: db.manageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: db.memberPassages,
                        as: 'memberPassagesLegis',
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ]
                    }
                ]
            });

            // Get the recommendation ID
            const recommendationId = updatedLegislativeBill?.introducedInHousesLegis?.fkManageCommitteeRecomendationId;
            
            // If there's a recommendation ID, fetch the full recommendation data
            if (recommendationId) {
                const recommendation = await db.manageCommitteeRecomendations.findByPk(recommendationId, {
                    raw: true, // Add this to get plain object
                    attributes: ['id', 'committeeRecomendation', 'committeeStatus', 'createdAt', 'updatedAt']
                });
                if (recommendation && updatedLegislativeBill.introducedInHousesLegis) {
                    updatedLegislativeBill.introducedInHousesLegis.manageCommitteeRecomendations = recommendation;
                }
            }

            // Parse the files in billDocuments if they exist
            if (updatedLegislativeBill.billDocumentsLegis) {
                updatedLegislativeBill.billDocumentsLegis.forEach(doc => {
                    if (doc.file) {
                        doc.file = doc.file.map(file => JSON.parse(file));
                    }
                });
            }

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