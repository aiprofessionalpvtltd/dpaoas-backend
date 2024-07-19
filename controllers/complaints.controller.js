
const complaintsService = require('../services/complaints.service');
const logger = require('../common/winston');
const db = require("../models")
const Complaints = db.complaints
const Users = db.users

const complaintsController = {
    // Issue and Save new Complaint
    issueComplaint: async (req, res) => {
        try {
            logger.info(`ComplaintController: issueComplaint body ${JSON.stringify(req.body)}`)
            const complaint = await complaintsService.issueComplaint(req.body)
            // if (complaint) {
            //     if (req.file) {
            //         const path = req.file.destination.replace('./public/', '/public/')
            //         try {
            //             // Your code to update the database
            //             await Complaints.update(
            //                 {
            //                     complaintAttachmentFromComplainee: `${path}/${req.file.originalname}`,
            //                 },
            //                 {
            //                     where: { id: complaint.dataValues.id }
            //                 }
            //             );
            //             const updatedComplaint = await Complaints.findOne({ where: { id: complaint.id } });
            logger.info("Complaint Issued Successfully!")
            return res.status(200).send({
                success: true,
                message: "Complaint Issued Successfully!",
                data: complaint,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve All Complaints For Admin Side
    findAllComplaints: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaints query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, complaints } = await complaintsService.findAllComplaints(currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (complaints.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaints Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints Fetched Successfully!",
                data: {
                    complaints,
                    totalPages,
                    count
                }
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieve All Complaints For Toner Installation Only
    findAllComplaintsForToner: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaintsForToner query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, complaints } = await complaintsService.findAllComplaintsForToner(currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (complaints.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaints For Toner Installation Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints For Toner Installation Fetched Successfully!",
                data: {
                    complaints,
                    totalPages,
                    count
                }
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieve All Complaints By Complainee
    findAllComplaintsByComplainee: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaintsByComplainee id and query${JSON.stringify(req.params.id, req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const complaineeId = req.params.id;
            const complaintUser = await Users.findOne({ where: { id: complaineeId } })
            if (!complaintUser) {
                throw ({ message: 'Complainee User Not Found!' })
            }
            const { count, totalPages, complaints } = await complaintsService.findAllComplaintsByComplainee(complaineeId, currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (complaints.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaints Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints Fetched Successfully!",
                data: {complaints,
                totalPages,
                count}
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Retrieve All Complaints By Resolver
    findAllComplaintsByResolver: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaintsByResolver id and query${JSON.stringify(req.params.id, req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const resolverId = req.params.id;
            const complaintResolver = await Users.findOne({ where: { id: resolverId } })
            if (!complaintResolver) {
                throw ({ message: 'Resolver User Not Found!' })
            }
            const { count, totalPages, complaints } = await complaintsService.findAllComplaintsByResolver(resolverId, currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (complaints.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaints Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints Fetched Successfully!",
                data: {complaints,
                totalPages,
                count}
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    //Search Complaint
    searchComplaint: async (req, res) => {
        try {
            logger.info(`ComplaintController: searchComplaint query ${JSON.stringify(req.query)}`)
            if (Object.keys(req.query).length !== 0) {
                // Assuming the search criteria are passed as query parameters
                const searchCriteria = req.query; // This will be an object with search fields   
                const searchResults = await complaintsService.searchComplaint(searchCriteria);
                if (searchResults.length > 0) {
                    logger.info("Searched Successfully!");
                    return res.status(200).send({
                        success: true,
                        message: "Complaints Search Results!",
                        data: searchResults,
                    });
                } else {
                    logger.info("Data Not Found!");
                    return res.status(200).send({
                        success: true,
                        message: "Data Not Found!",
                        data: searchResults,
                    });
                }
            }
            else {
                logger.info("Please Enter Any Field To Search!");
                return res.status(400).send({
                    success: true,
                    message: "Please Enter Any Field To Search!",
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

    // Retrieve Single Complaint
    findSingleComplaint: async (req, res) => {
        try {
            logger.info(`ComplaintController: findSinlgeComplaint id${JSON.stringify(req.params.id)}`)
            const complaintId = req.params.id;
            const complaint = await complaintsService.findSingleComplaint(complaintId);
            logger.info(`Single Complaint:${complaintId} Fetched Successfully!`)
            return res.status(200).send({
                success: true,
                message: "Single Complaint Fetched Successfully!",
                data: complaint,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Resolve Complaints
    resolveComplaint: async (req, res) => {
        try {
            logger.info(`ComplaintController: findSinlgeComplaint resolveComplaint id and body ${JSON.stringify(req.params.id, req.body)}`)
            const complaintId = req.params.id;
            const complaint = await Complaints.findByPk(complaintId);
            if (!complaint) {
                throw { message: "Complaint Not Found!" };
            }

            // Prepare the update object
            let updateData = req.body;

            // Check if there's a file to be uploaded
            if (req.file) {
                const path = req.file.destination.replace('./public/', '/public/') + '/' + req.file.originalname;
                updateData.complaintAttachmentFromResolver = path;
            }

            // Call the service function to update the complaint
            await complaintsService.resolveComplaint(complaintId, updateData);
            const updatedComplaint = await Complaints.findOne({ where: { id: complaintId } });
            // Log and respond
            logger.info(`Complaint:${complaintId} resolved Successfully!`);
            return res.status(200).send({
                success: true,
                message: "Complaint Resolved Successfully!",
                data: updatedComplaint,
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message,
            });
        }
    },

    // Retrieve All Complaint Types
    findAllComplaintTypes: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaintTypes query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, complaintTypes } = await complaintsService.findAllComplaintTypes(currentPage, pageSize);
            // Check if there are no complaints on the current page
            if (complaintTypes.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaint Types Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints Types Fetched Successfully!",
                data: complaintTypes,
                totalPages,
                count
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },


    // Retreive All Complaint Categories
    findAllComplaintCategories: async (req, res) => {
        try {
            logger.info(`ComplaintController: findAllComplaintCategories query ${JSON.stringify(req.query)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, complaintCategories } = await complaintsService.findAllComplaintCategories(currentPage, pageSize);
            // Check if there are no complaint categories on the current page
            if (complaintCategories.length === 0) {
                logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
            }
            logger.info("Complaint Types Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Complaints Types Fetched Successfully!",
                data: complaintCategories,
                totalPages,
                count
            });

        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    // Delete Complaint By Admin
    deleteComplaint: async (req, res) => {
        try {
            logger.info(`ComplaintController: deleteComplaint id ${JSON.stringify(req.params.id)}`)
            const complaintId = req.params.id;
            const complaint = await Complaints.findByPk(complaintId);
            if (!complaint) {
                throw ({ message: "Complaint Not Found!" });
            }
            const deletedComplaint = await complaintsService.deleteComplaint(complaintId);
            logger.info("Complaint Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Complaint Deleted Successfully!",
                data: deletedComplaint,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Assigning Complaints to Engineers/Resolvers
    assignmentOfComplaints: async (req, res) => {
        try {
            logger.info(`ComplaintController: assignmentOfComplaints id and body${JSON.stringify(req.params.id, req.body)}`)
            const complaintId = req.params.id;
            const complaint = await Complaints.findByPk(complaintId);
            if (!complaint) {
                throw ({ message: "Complaint Not Found!" });
            }
            const assignmentOfComplaint = await complaintsService.assignmentOfComplaints(complaintId, req.body);
            logger.info("Complaint Has Been Assigned to Resolver Successfully!")
            return res.status(200).send({
                success: true,
                message: "Complaint Has Been Assigned to Resolver Successfully!",
                data: assignmentOfComplaint,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve Complaints For Assigned Resolvers/Engineers
    retrieveAssignedComplaints: async (req, res) => {
        try {
            logger.info(`ComplaintController: retrieveAssignedComplaints id and query${JSON.stringify(req.params.id, req.query)}`)
            const assigneeId = req.params.id;
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const { count, totalPages, complaints } = await complaintsService.retrieveAssignedComplaints(assigneeId, currentPage, pageSize);
            logger.info(`Single Complaint Fetched Successfully!`)
            return res.status(200).send({
                success: true,
                message: `Single Complaint Fetched Successfully!`,
                data: {
                    complaints,
                    count,
                    totalPages
                },
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },
    
    // Retrieve Emplpoyees who are Engineers 
    retrieveEmployeesAsEngineers: async(req,res) => 
    {
        try {
            logger.info(`ComplaintController: retriveEmployeesAsEngineers query${JSON.stringify(req.query)}`)
            // Parsing query parameters for pagination
            const currentPage = parseInt(req.query.currentPage) ;
            const pageSize = parseInt(req.query.pageSize);      
            const { count, totalPages, employees } = await complaintsService.retrieveEmployeesAsEngineers(currentPage, pageSize);
            // Check if there are no departments on the current page
            if (employees.length === 0) {
              logger.info("No data found on this page!")
                return res.status(200).send({
                    success: false,
                    message: 'No data found on this page!',
                    data: []
                });
              }
            logger.info("Employees who are IT Engineers are Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Employees who are IT Engineers are Fetched Successfully!",
                data: { employees,
                totalPages,
                count }
            });
      
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
      
    }


}

module.exports = complaintsController;