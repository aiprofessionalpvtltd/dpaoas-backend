const db = require("../models");
const IntroducedInSenateBills = db.financeMoneyBills;
const SenateBillMnaMovers = db.senateBillMnaMovers;
const SenateBillMinistryMovers = db.senateBillMinistryMovers;
const SenateBillSenatorMovers = db.senateBillSenatorMovers;
const IntroducedInHouses = db.introducedInHouses;
const MemberPassages = db.memberPassages;
const BillDocuments = db.billDocuments;
const members = db.members;
const ministries = db.ministries;
const mnas = db.mnas;
const Sessions = db.sessions;
const ManageCommittees = db.manageCommittees;
const ManageCommitteeRecomendations = db.manageCommitteeRecomendations;
const Users = db.users;
const ParliamentaryYears = db.parliamentaryYears;
const ParliamentaryYearsMna = db.parliamentaryYearsMna;
const Employees = db.employees;
const BillStatuses = db.billStatuses;
const { Sequelize } = require('sequelize');
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const senateBillService = {
    // Create A New Senate Bill
    createSenateBill: async (senateBillData) => {
        try {
            const { senateBillSenatorMovers, senateBillMinistryMovers, senateBillMnaMovers, ...senateBillAttributes } = senateBillData;

            const createdSenateBill = await IntroducedInSenateBills.create(senateBillAttributes);
            const senateBillId = createdSenateBill.id;

            if (senateBillSenatorMovers) {
                await Promise.all(senateBillSenatorMovers.map(async (mover) => {
                    await SenateBillSenatorMovers.create({
                        fkFinanceMoneyBillId: senateBillId,  // Changed from fkIntroducedInSenateBillId
                        fkSenatorId: mover.fkSenatorId,
                        fkIntroducedInSenateBillId: null
                    });
                }));
            }

            if (senateBillMinistryMovers) {
                await Promise.all(senateBillMinistryMovers.map(async (mover) => {
                    await SenateBillMinistryMovers.create({
                        fkFinanceMoneyBillId: senateBillId,  // Changed from fkIntroducedInSenateBillId
                        fkMinistryId: mover.fkMinistryId,
                        fkIntroducedInSenateBillId: null  // Explicitly set to null
                    });
                }));
            }

            if (senateBillMnaMovers) {
                await Promise.all(senateBillMnaMovers.map(async (mover) => {
                    await SenateBillMnaMovers.create({
                        fkFinanceMoneyBillId: senateBillId,  // Changed from fkIntroducedInSenateBillId
                        fkMnaId: mover.fkMnaId,
                        fkIntroducedInSenateBillId: null
                    });
                }));
            }

            return createdSenateBill;
        } catch (error) {
            throw { message: error.message || "Error Creating Senate Bill" };
        }
    },

    // Retrieve All Introduced In Senate Bills
    findAllIntroducedInSenateBills: async (currentPage, pageSize, billFrom) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const whereClause = {};
            if (billFrom) {
                whereClause.billFrom = billFrom;
            }

            const { count, rows } = await IntroducedInSenateBills.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ],
                where: whereClause,
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: ParliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    {
                        model: ParliamentaryYearsMna,
                        as: 'mnaParliamentaryYears'
                    },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    {
                        model: db.tenuresMinister,
                        as: 'tenuresMinisters'
                    },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: SenateBillSenatorMovers,
                        as: 'senateBillSenatorMovers',
                        include: [
                            { model: members, as: 'member' }
                        ]
                    },
                    {
                        model: SenateBillMinistryMovers,
                        as: 'senateBillMinistryMovers',
                        include: [
                            { model: ministries, as: 'ministries' }
                        ]
                    },
                    {
                        model: SenateBillMnaMovers,
                        as: 'senateBillMnaMovers',
                        include: [
                            { model: mnas, as: 'mna' }
                        ]
                    },
                    {
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: MemberPassages,
                        as: 'memberPassagesFinance',  // Changed from 'memberPassages'
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ],
                        attributes: ['id', 'memeberStatus', 'memeberNoticeDate', 'dateOfConsiderationBill', 'fkSessionMemberPassageId', 'fkFinanceMemberPassageId'] // Explicitly include all needed fields
                    },
                    {
                        model: BillDocuments,
                        as: 'billDocuments'
                    }
                ],
                distinct: true,
            });

            // Parse the files in the billDocuments
            if (rows.billDocuments && rows.billDocuments.length > 0) {
                rows.billDocuments.forEach(doc => {
                    if (doc.file) {
                        doc.file = doc.file.map(file => JSON.parse(file));
                    }
                });
            }

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, senateBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All senate Bills");
        }
    },

    // Retrieve All Introduced In Senate Bills By Category
    findAllIntroducedInSenateBillsByCategory: async (currentPage, pageSize, billCategory, billFrom) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const whereClause = {};
            if (billCategory) {
                whereClause.billCategory = billCategory;
            }
            if (billFrom) {
                whereClause.billFrom = billFrom;
            }

            const { count, rows } = await IntroducedInSenateBills.findAndCountAll({
                offset,
                limit,
                where: whereClause,
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: ParliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    {
                        model: ParliamentaryYearsMna,
                        as: 'mnaParliamentaryYears'
                    },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    {
                        model: db.tenuresMinister,
                        as: 'tenuresMinisters'
                    },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: SenateBillSenatorMovers,
                        as: 'senateBillSenatorMovers',  // Changed from 'financeMoneyBillSenatorMovers'
                        required: false,
                        include: [
                            { 
                                model: members, 
                                as: 'member',
                                required: false
                            }
                        ]
                    },
                    {
                        model: SenateBillMinistryMovers,
                        as: 'senateBillMinistryMovers',  // Changed from 'financeMoneyBillMinistryMovers'
                        required: false,
                        include: [
                            { 
                                model: ministries, 
                                as: 'ministries',
                                required: false
                            }
                        ]
                    },
                    {
                        model: SenateBillMnaMovers,
                        as: 'senateBillMnaMovers',  // Changed from 'financeMoneyBillMnaMovers'
                        required: false,
                        include: [
                            { 
                                model: mnas, 
                                as: 'mna',
                                required: false
                            }
                        ]
                    },
                    {
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: MemberPassages,
                        as: 'memberPassagesFinance',  // Changed from 'memberPassages'
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ],
                        attributes: ['id', 'memeberStatus', 'memeberNoticeDate', 'dateOfConsiderationBill', 'fkSessionMemberPassageId', 'fkFinanceMemberPassageId'] // Explicitly include all needed fields
                    },
                    {
                        model: BillDocuments,
                        as: 'billDocuments'
                    }
                ],
                distinct: true,
            });

             // Parse the files in the billDocuments
             if (rows.billDocuments && rows.billDocuments.length > 0) {
                rows.billDocuments.forEach(doc => {
                    if (doc.file) {
                        doc.file = doc.file.map(file => JSON.parse(file));
                    }
                });
            }

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, senateBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All finance/money Bills by Category");
        }
    },

    // Search All Introduced In Senate Bills
    searchAllIntroducedInSenateBills: async (filters, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const filterOptions = {};

            const includeOptions = [
                {
                    model: Users,
                    as: 'user',
                    include: [
                        {
                            model: Employees,
                            as: 'employee',
                            attributes: ['id', 'firstName', 'lastName', 'userName'],
                        }
                    ]
                },
                {
                    model: ParliamentaryYears,
                    as: 'parliamentaryYears'
                },
                {
                    model: ParliamentaryYearsMna,
                    as: 'mnaParliamentaryYears'
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
                    as: 'sessions'
                },
                {
                    model: BillStatuses,
                    as: 'billStatuses'
                },
                {
                    model: SenateBillSenatorMovers,
                    as: 'senateBillSenatorMovers',
                    include: [
                        { model: members, as: 'member' }
                    ]
                },
                {
                    model: SenateBillMinistryMovers,
                    as: 'senateBillMinistryMovers',
                    include: [
                        { model: ministries, as: 'ministries' }
                    ]
                },
                {
                    model: SenateBillMnaMovers,
                    as: 'senateBillMnaMovers',
                    include: [
                        { model: mnas, as: 'mna' }
                    ]
                },
                {
                    model: IntroducedInHouses,
                    as: 'introducedInHouses',
                    include: [
                        { model: Sessions, as: 'sessions' },
                        { model: ManageCommittees, as: 'manageCommittees' },
                        { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                    ]
                },
                {
                    model: MemberPassages,
                    as: 'memberPassagesFinance',  // Changed from 'memberPassages'
                    include: [
                        { model: Sessions, as: 'sessions' }
                    ],
                    attributes: ['id', 'memeberStatus', 'memeberNoticeDate', 'dateOfConsiderationBill', 'fkSessionMemberPassageId', 'fkFinanceMemberPassageId'] // Explicitly include all needed fields
                },
                {
                    model: BillDocuments,
                    as: 'billDocuments'
                }
            ];

            if (filters) {
                if (filters.keyword) {
                    filterOptions[Sequelize.Op.or] = [
                        { billTitle: { [Sequelize.Op.like]: `%${filters.keyword}%` } },
                        { billText: { [Sequelize.Op.like]: `%${filters.keyword}%` } },
                    ];
                }

                if (filters && filters.fkSenatorId) {
                    includeOptions.push({
                        model: SenateBillSenatorMovers,
                        as: 'senateBillSenatorMovers',
                        where: { fkSenatorId: filters.fkSenatorId },
                        include: [
                            { model: members, as: 'member' }
                        ],
                    });
                }

                if (filters && filters.fkMnaId) {
                    includeOptions.push({
                        model: SenateBillMnaMovers,
                        as: 'senateBillMnaMovers',
                        where: { fkMnaId: filters.fkMnaId },
                        include: [
                            { model: mnas, as: 'mna' }
                        ]
                    });
                }

                if (filters && filters.fkMinistryId) {
                    includeOptions.push({
                        model: SenateBillMinistryMovers,
                        as: 'senateBillMinistryMovers',
                        where: { fkMinistryId: filters.fkMinistryId },
                        include: [
                            { model: ministries, as: 'ministries' }
                        ]
                    });
                }

                if (filters.fkParliamentaryYearId) {
                    filterOptions.fkParliamentaryYearId = filters.fkParliamentaryYearId;
                }

                if (filters.fkSessionIdFrom && filters.fkSessionIdto) {
                    filterOptions.fkSessionId = {
                        [Sequelize.Op.between]: [filters.fkSessionIdFrom, filters.fkSessionIdto]
                    };
                } else if (filters.fkSessionIdFrom) {
                    filterOptions.fkSessionId = { [Sequelize.Op.gte]: filters.fkSessionIdFrom };
                } else if (filters.fkSessionIdto) {
                    filterOptions.fkSessionId = { [Sequelize.Op.lte]: filters.fkSessionIdto };
                }

                if (filters.billFrom) {
                    filterOptions.billFrom = filters.billFrom;
                }

                if (filters.billCategory) {
                    filterOptions.billCategory = filters.billCategory;
                }

                if (filters.fkBillStatus) {
                    filterOptions.fkBillStatus = filters.fkBillStatus;
                }

                if (filters.billType) {
                    filterOptions.billType = filters.billType;
                }

                if (filters && filters.fkManageCommitteeId) {
                    includeOptions.push({
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        where: { fkManageCommitteeId: filters.fkManageCommitteeId },
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    });
                }

                if (filters && filters.fkManageCommitteeRecomendationId) {
                    includeOptions.push({
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        where: { fkManageCommitteeRecomendationId: filters.fkManageCommitteeRecomendationId },
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    });
                }

                if (filters.fileNumber) {
                    filterOptions.fileNumber = filters.fileNumber;
                }

                if (filters.noticeDateFrom && filters.noticeDateTo) {
                    filterOptions.noticeDate = {
                        [Sequelize.Op.between]: [new Date(filters.noticeDateFrom), new Date(filters.noticeDateTo)]
                    };
                } else if (filters.noticeDateFrom) {
                    filterOptions.noticeDate = { [Sequelize.Op.gte]: new Date(filters.noticeDateFrom) };
                } else if (filters.noticeDateTo) {
                    filterOptions.noticeDate = { [Sequelize.Op.lte]: new Date(filters.noticeDateTo) };
                }

                if (filters && filters.introducedInHouseDate) {
                    const introducedInHouseDate = new Date(filters.introducedInHouseDate);

                    includeOptions.push({
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        where: { introducedInHouseDate },
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    });
                }
            }

            const { count, rows } = await IntroducedInSenateBills.findAndCountAll({
                offset,
                limit,
                where: filterOptions,
                include: includeOptions,
                distinct: true,
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, senateBills: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All senate Bills");
        }
    },

    // Retrieve Single Introduced In Senate Bill
    findSinlgeIntroducedInSenateBill: async (senateBillId) => {
        try {
            const senateBill = await IntroducedInSenateBills.findOne({
                where: { id: senateBillId },
                include: [
                    {
                        model: Users,
                        as: 'user',
                        include: [
                            {
                                model: Employees,
                                as: 'employee',
                                attributes: ['id', 'firstName', 'lastName', 'userName'],
                            }
                        ]
                    },
                    {
                        model: ParliamentaryYears,
                        as: 'parliamentaryYears'
                    },
                    {
                        model: db.parliamentaryYearsMna,
                        as: 'mnaParliamentaryYears'
                    },
                    {
                        model: db.tenures,
                        as: 'tenures'
                    },
                    {
                        model: db.tenuresMinister,
                        as: 'tenuresMinisters'
                    },
                    {
                        model: db.terms,
                        as: 'terms'
                    },
                    {
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    },
                    {
                        model: SenateBillSenatorMovers,
                        as: 'senateBillSenatorMovers',
                        include: [
                            { model: members, as: 'member' }
                        ]
                    },
                    {
                        model: SenateBillMinistryMovers,
                        as: 'senateBillMinistryMovers',
                        include: [
                            { model: ministries, as: 'ministries' }
                        ]
                    },
                    {
                        model: SenateBillMnaMovers,
                        as: 'senateBillMnaMovers',
                        include: [
                            { model: mnas, as: 'mna' }
                        ]
                    },
                    {
                        model: IntroducedInHouses,
                        as: 'introducedInHouses',
                        include: [
                            { model: Sessions, as: 'sessions' },
                            { model: ManageCommittees, as: 'manageCommittees' },
                            { model: ManageCommitteeRecomendations, as: 'manageCommitteeRecomendations' }
                        ]
                    },
                    {
                        model: MemberPassages,
                        as: 'memberPassagesFinance',  // Changed from 'memberPassages'
                        required: false,
                        include: [
                            { model: Sessions, as: 'sessions' }
                        ],
                        attributes: ['id', 'memeberStatus', 'memeberNoticeDate', 'dateOfConsiderationBill', 'fkSessionMemberPassageId', 'fkFinanceMemberPassageId'] // Explicitly include all needed fields
                    },
                    {
                        model: BillDocuments,
                        as: 'billDocuments'
                    }
                ],
            });
            if (!senateBill) {
                throw ({ message: "senate Bill Not Found!" })
            }

            // Parse the files in the billDocuments
            if (senateBill.billDocuments && senateBill.billDocuments.length > 0) {
                senateBill.billDocuments.forEach(doc => {
                    if (doc.file) {
                        doc.file = doc.file.map(file => JSON.parse(file));
                    }
                });
            }

            return senateBill;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single senate Bill" };
        }
    },

    // Update senate Bill Data
    updateIntroducedInSenateBill: async (updatedData, senateBillId) => {
        try {
            let IntroducedInSenateBill;

            // Update Senate bill attributes if provided in updatedData
            if (Object.keys(updatedData).length > 0) {
                IntroducedInSenateBill = await IntroducedInSenateBills.update(updatedData, { 
                    where: { id: senateBillId } 
                });
            }

            if (updatedData.senateBillSenatorMovers) {
                // Delete existing SenateBillSenatorMovers entries
                await SenateBillSenatorMovers.destroy({ 
                    where: { fkFinanceMoneyBillId: senateBillId } 
                });
                // Create new SenateBillSenatorMovers entries
                await Promise.all(updatedData.senateBillSenatorMovers.map(async (mover) => {
                    await SenateBillSenatorMovers.create({
                        fkFinanceMoneyBillId: senateBillId,
                        fkSenatorId: mover.fkSenatorId,
                        fkIntroducedInSenateBillId: null
                    });
                }));
            }

            if (updatedData.senateBillMinistryMovers) {
                // Delete existing SenateBillMinistryMovers entries
                await SenateBillMinistryMovers.destroy({ 
                    where: { fkFinanceMoneyBillId: senateBillId } 
                });
                // Create new SenateBillMinistryMovers entries
                await Promise.all(updatedData.senateBillMinistryMovers.map(async (mover) => {
                    await SenateBillMinistryMovers.create({
                        fkFinanceMoneyBillId: senateBillId,
                        fkMinistryId: mover.fkMinistryId,
                        fkIntroducedInSenateBillId: null
                    });
                }));
            }

            if (updatedData.senateBillMnaMovers) {
                // Delete existing SenateBillMnaMovers entries
                await SenateBillMnaMovers.destroy({ 
                    where: { fkFinanceMoneyBillId: senateBillId } 
                });
                // Create new SenateBillMnaMovers entries
                await Promise.all(updatedData.senateBillMnaMovers.map(async (mover) => {
                    await SenateBillMnaMovers.create({
                        fkFinanceMoneyBillId: senateBillId,
                        fkMnaId: mover.fkMnaId,
                        fkIntroducedInSenateBillId: null
                    });
                }));
            }

            // Update or create associated data if provided
            if (IntroducedInSenateBill) {
                // Check if data already exists for the given senateBillId
                const existingIntroducedInHouse = await IntroducedInHouses.findOne({ 
                    where: { fkFinanceMoneyHouseId: senateBillId } 
                });
                if (existingIntroducedInHouse) {
                    // Update existing record
                    await IntroducedInHouses.update({
                        fkFinanceMoneyHouseId: senateBillId,
                        fkSessionHouseId: updatedData.fkSessionHouseId,
                        fkManageCommitteeId: updatedData.fkManageCommitteeId,
                        introducedInHouseDate: updatedData.introducedInHouseDate,
                        referedOnDate: updatedData.referedOnDate,
                        fkManageCommitteeRecomendationId: updatedData.fkManageCommitteeRecomendationId,
                        reportPresentationDate: updatedData.reportPresentationDate
                    }, { where: { fkFinanceMoneyHouseId: senateBillId } });
                } else {
                    // Create new record
                    await IntroducedInHouses.create({
                        fkFinanceMoneyHouseId: senateBillId,
                        fkSessionHouseId: updatedData.fkSessionHouseId,
                        fkManageCommitteeId: updatedData.fkManageCommitteeId,
                        introducedInHouseDate: updatedData.introducedInHouseDate,
                        referedOnDate: updatedData.referedOnDate,
                        fkManageCommitteeRecomendationId: updatedData.fkManageCommitteeRecomendationId,
                        reportPresentationDate: updatedData.reportPresentationDate
                    });
                }
            }

            if (IntroducedInSenateBill) {
                const existingMemberPassage = await MemberPassages.findOne({ 
                    where: { fkFinanceMemberPassageId: senateBillId } 
                });
                if (existingMemberPassage) {
                    await MemberPassages.update({
                        fkSessionMemberPassageId: updatedData.fkSessionMemberPassageId,
                        memeberStatus: updatedData.memeberStatus,
                        memeberNoticeDate: updatedData.memeberNoticeDate,
                        dateOfConsiderationBill: updatedData.dateOfConsiderationBill
                    }, { where: { fkFinanceMemberPassageId: senateBillId } });
                } else {
                    await MemberPassages.create({
                        fkFinanceMemberPassageId: senateBillId,
                        fkSessionMemberPassageId: updatedData.fkSessionMemberPassageId,
                        memeberStatus: updatedData.memeberStatus,
                        memeberNoticeDate: updatedData.memeberNoticeDate,
                        dateOfConsiderationBill: updatedData.dateOfConsiderationBill
                    });
                }
            }

            // Update or create bill documents
            if (IntroducedInSenateBill && updatedData.documentType) {
                const existingBillDocument = await BillDocuments.findOne({
                    where: {
                        fkBillDocumentId: senateBillId,
                        documentType: updatedData.documentType
                    }
                });

                if (existingBillDocument) {
                    await BillDocuments.update({
                        documentType: updatedData.documentType,
                        documentDate: updatedData.documentDate,
                        documentDiscription: updatedData.documentDiscription,
                    }, {
                        where: {
                            fkBillDocumentId: senateBillId,
                            documentType: updatedData.documentType
                        }
                    });
                } else {
                    await BillDocuments.create({
                        fkBillDocumentId: senateBillId,
                        documentType: updatedData.documentType,
                        documentDate: updatedData.documentDate,
                        documentDiscription: updatedData.documentDiscription,
                    });
                }
            }

            // Return the updated Senate bill data
            const updatedSenateBill = await IntroducedInSenateBills.findByPk(senateBillId);
            return updatedSenateBill;

        } catch (error) {
            throw { message: error.message || "Error Updating Finance Money Bill Data" };
        }
    },

    // Delete senate Bill
    deleteIntroducedInSenateBill: async (senateBillId) => {
        try {

            const updatedData = {
                billStatus: "inactive"
            }

            await IntroducedInSenateBills.update(updatedData, { where: { id: senateBillId } });

            // Fetch the updated MNA Data after the update
            const updatedSenateBill = await IntroducedInSenateBills.findByPk(senateBillId, { raw: true });

            return updatedSenateBill;


        } catch (error) {
            throw { message: error.message || "Error deleting Senate Bill" };
        }
    }


}

module.exports = senateBillService