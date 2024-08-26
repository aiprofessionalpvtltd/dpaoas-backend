const db = require("../models");
const Ordinances = db.ordinances;
const Users = db.users;
const Employees = db.employees;
const ParliamentaryYears = db.parliamentaryYears;
const Sessions = db.sessions;
const BillStatuses = db.billStatuses;
const Op = db.Sequelize.Op;
const { Sequelize } = require('sequelize');
const logger = require('../common/winston');


const ordinanceService = {
    // Create A New Ordinance
    createOrdinance: async (req) => {
        try {

            
                // Destructure the fields and handle empty dates
                const {
                    fkParliamentaryYearId,
                    fkSessionId,
                    fkUserId,
                    ordinanceTitle,
                    dateOfLayingInTheSenate,
                    dateOfLayingInTheNA,
                    fkOrdinanceStatus,
                } = req;
        
                // Create a payload that includes all other fields and handles empty dates
                const payload = {
                    fkParliamentaryYearId,
                    fkSessionId,
                    fkUserId,
                    ordinanceTitle,
                   
                    dateOfLayingInTheSenate: dateOfLayingInTheSenate || null,
                    dateOfLayingInTheNA: dateOfLayingInTheNA || null,
                    fkOrdinanceStatus,

                };
        

                // Create the ordinance using the payload
                const ordinances = await Ordinances.create(payload);

            // const ordinances = await Ordinances.create(req);

            return ordinances;
        } catch (error) {
            throw { message: error.message || "Error Creating ordinances" };

        }
    },

    // Retrieve All Ordinances
    findAllOrdinances: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const { count, rows } = await Ordinances.findAndCountAll({
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ],
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
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, ordinance: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All ordinances");
        }
    },
    // search All Ordinances
    searchAllOrdinance: async (filters, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            const filterOptions = {};

            if (filters) {
                if (filters.keyword) {
                    filterOptions[Sequelize.Op.or] = [
                        { ordinanceTitle: { [Sequelize.Op.like]: `%${filters.keyword}%` } },
                        { ordinanceRemarks: { [Sequelize.Op.like]: `%${filters.keyword}%` } },
                    ];
                }

                if (filters.fkOrdinanceStatus) {
                    filterOptions.fkOrdinanceStatus = filters.fkOrdinanceStatus;
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
            }

            const { count, rows } = await Ordinances.findAndCountAll({
                offset,
                limit,
                where: filterOptions,
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
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });

            const totalPages = Math.ceil(count / pageSize);

            return { count, totalPages, ordinance: rows };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All ordinances");
        }
    },

    // Retrieve Single Ordinances
    findSingleOrdinance: async (ordinanceId) => {
        try {
            const ordinances = await Ordinances.findOne({
                where: { id: ordinanceId },
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
                        model: Sessions,
                        as: 'sessions'
                    },
                    {
                        model: BillStatuses,
                        as: 'billStatuses'
                    }
                ],
            });
            if (!ordinances) {
                throw ({ message: "ordinance Not Found!" })
            }

             // Parse the `file` column if it exists and contains JSON strings
             if (ordinances.file) {
                // Parse the files and filter out any null values due to parsing errors
                const parsedFiles = ordinances.file.map(fileString => {
                    try {
                        return JSON.parse(fileString);
                    } catch (e) {
                        console.error("Error parsing JSON:", e);
                        return null;
                    }
                }).filter(file => file !== null);
            
                // Group files by type and date
                const groupedFiles = parsedFiles.reduce((acc, file) => {
                    const { type, date } = file;
                    const dateGroup = acc.find(group => group.type === type && group.date === date);
                    
                    if (dateGroup) {
                        dateGroup.files.push({ id: file.id, path: file.path });
                    } else {
                        acc.push({
                            type,
                            date,
                            files: [{ id: file.id, path: file.path }]
                        });
                    }
                    
                    return acc;
                }, []);
            
                ordinances.file = groupedFiles;
            }
            


        
            return ordinances;
        }
        catch (error) {
            throw { message: error.message || "Error Fetching Single contactTemplate" };
        }
    },

    // Update Ordinance
    updateOrdinance: async (req, ordinanceId) => {
        try {

            await Ordinances.update(req, { where: { id: ordinanceId } });

            // Fetch the updated contactTemplate after the update
            const updatedOrdinance = await Ordinances.findOne({
                where: { id: ordinanceId },
                include: [
                    {
                        model: Users,
                        as: 'user',
                        attributes: ['email', 'userStatus'],
                    },
                ],
            }, { raw: true });

            return updatedOrdinance;

        } catch (error) {
            throw { message: error.message || "Error Updating Ordinance" };
        }
    },

    // Delete Ordinance
    deleteOrdinance: async (req) => {
        try {

            const updatedData = {
                ordinanceStatus: "inactive"
            }

            await Ordinances.update(updatedData, { where: { id: req } });

            // Fetch the updated Ordinance after the update
            const updatedOrdinance = await Ordinances.findByPk(req, { raw: true });

            return updatedOrdinance;


        } catch (error) {
            throw { message: error.message || "Error deleting Ordinance" };
        }
    }


}

module.exports = ordinanceService