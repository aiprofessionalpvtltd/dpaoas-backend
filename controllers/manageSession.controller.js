const manageSessionsService = require("../services/manageSession.service")
const db = require("../models")
const ManageSessions = db.manageSessions
const Sessions = db.sessions
const path = require('path');
const fs = require('fs');
const logger = require('../common/winston');
const {
    validationErrorResponse,
    notFoundResponse,
    unAuthorizedResponse,
} = require('../common/validation-responses')
const manageSessionController = {

    // Create Session Sitting
    createSessionSitting: async (req, res) => {
        try {
            logger.info(`manageSessionController: createSessionSitting body ${JSON.stringify(req.body)}`)
            const session = await manageSessionsService.createSessionSitting(req.body);
            logger.info("Session Sitting Created Successfully!")
            return res.status(200).send({
                success: true,
                message: "Session Sitting Created Successfully!",
                data: session,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Retrive All Session Sittings
    getAllSessionSittings: async (req, res) => {
        try {
            logger.info(`manageSessionController: geAllSessionSittings query ${JSON.stringify(req.query)}`)
            // const currentPage = parseInt(req.query.currentPage);
            // const pageSize = parseInt(req.query.pageSize);
            const year = req.query.year;
            const { sessionSittings } = await manageSessionsService.getAllSessionSittings(year);
            const pdfData = await manageSessionsService.generateSessionSittingsPDF(sessionSittings, year)

            // if (sessionSittings.length === 0) {
            //     logger.info("No data found on this page!")
            //     return res.status(200).send({
            //         success: true,
            //         message: 'No data found on this page!'
            //     });
            // }
            // else {

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;


            logger.info("All Session Sittings Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "All Session Sittings Fetched Successfully!",
                data: { fileLink }
            });
            //  }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrieve Session Sittings for upto 3 Years
    getUpto3YearsSessionSittings: async (req, res) => {
        try {
            logger.info(`manageSessionController: getUpto3YearsSessionSittings query ${JSON.stringify(req.query)}`)
            // const currentPage = parseInt(req.query.currentPage);
            // const pageSize = parseInt(req.query.pageSize);
            const year = req.query.year;
            const sessionSittings = await manageSessionsService.getUpto3YearsSessionSittings(year);
            const pdfData = await manageSessionsService.generateSessionSittingsFor3YearsPDF(sessionSittings, year)

            // if (sessionSittings.length === 0) {
            //     logger.info("No data found on this page!")
            //     return res.status(200).send({
            //         success: true,
            //         message: 'No data found on this page!'
            //     });
            // }
            // else {

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;


            logger.info("All Session Sittings Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "All Session Sittings Fetched Successfully!",
                data: { fileLink }
            });
            //  }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Retrive Single Session Sitting
    getSingleSessionSitting: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSingleSessionSitting id ${JSON.stringify(req.params.id)}`)
            const sessionSittingId = req.params.id;
            const fetchedSession = await manageSessionsService.getSingleSessionSitting(sessionSittingId);
            logger.info("Single Session Sitting Fetched Successfully!")
            return res.status(200).send({
                success: true,
                message: "Single Session Sitting Fetched Successfully!",
                data: fetchedSession,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Update Session Sitting
    updateSessionSitting: async (req, res) => {
        try {
            logger.info(`manageSessionController: updateSessionSitting id and body ${JSON.stringify(req.params.id, req.body)}`)
            const sessionSittingId = req.params.id;
            const session = await ManageSessions.findByPk(sessionSittingId);
            if (!session) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const updatedSession = await manageSessionsService.updateSessionSitting(req.body, sessionSittingId);
            logger.info("Session Sitting Updated Successfully!")
            return res.status(200).send({
                success: true,
                message: "Session Sitting Updated Successfully!",
                data: updatedSession,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }

    },

    //Delete Session Sitting
    deleteSessionSitting: async (req, res) => {
        try {
            logger.info(`manageSessionController: deleteSessionSitting id ${JSON.stringify(req.params.id)}`)
            const sessionSittingId = req.params.id;
            const session = await ManageSessions.findByPk(sessionSittingId);
            if (!session) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const deletedSession = await manageSessionsService.deleteSessionSitting(sessionSittingId);
            logger.info("Session Sitting Deleted Successfully!")
            return res.status(200).send({
                success: true,
                message: "Session Sitting Deleted Successfully!",
                data: deletedSession,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    //Get Session Sittings On Session Id
    getSessionSittingsBySessionId: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSessionSittingsBySessionId query and id ${JSON.stringify(req.query, req.params.id)}`)
            const currentPage = parseInt(req.query.currentPage);
            const pageSize = parseInt(req.query.pageSize);
            const sessionId = req.params.id;
            const { count, totalPages, sessionSittings } = await manageSessionsService.getSessionSittingsBySessionId(sessionId, currentPage, pageSize);
            if (sessionSittings.length > 0) {
                logger.info("Session Sittings By Session Id Fetched Successfully!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting By Session Id Fetched Successfully!",
                    data: {
                        sessionSittings,
                        count,
                        totalPages
                    }
                })
            }
            else {
                logger.info("No Data Found!")
                return res.status(200).send({
                    success: true,
                    message: "No Data Found!",
                })
            }
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Session Sittings (Prorogued Sessions)
    getProroguedSessions: async (req, res) => {
        try {
            logger.info(`manageSessionController: getProroguedSessions query ${JSON.stringify(req.query)}`);
            const currentPage = req.query.currentPage;
            const pageSize = req.query.pageSize;

            const { count, totalPages, sessionSittings } = await manageSessionsService.getProroguedSessions(currentPage, pageSize);
            logger.info("Prorogued Sessions And Sittings Fetched Successfully!");
            return res.status(200).send({
                success: true,
                message: "Prorogued Sessions And Sittings Fetched Successfully!",
                data: {
                    sessionSittings,
                    count,
                    totalPages
                }
            });

        } catch (error) {
            logger.error(`Error in getProroguedSessions: ${error.message}`);

            return res.status(400).send({
                success: false,
                message: error.message || "An unexpected error occurred"
            });
        }
    },

    // Get Chairman, Deputy Chairman and Presiding Officer
    getTop3Members: async (req,res) => {
        try {
            logger.info(`manageSessionController: getTop3Members`);

            const members = await manageSessionsService.getTop3Members();
            logger.info("Chairman, Deputy Chairman and Presiding Officer Retrieved Successfully!");
            return res.status(200).send({
                success: true,
                message: "Chairman, Deputy Chairman and Presiding Officer Retrieved Successfully!",
                data: members
            });

        } catch (error) {
            return res.status(400).send({
                success: false,
                message: error.message || "An unexpected error occurred"
            });
        }
    },


    // Mark Session Sitting Attendance
    markSessionSittingAttendance: async (req, res) => {
        try {
            logger.info(`manageSessionController: markSessionSittingAttendance id ${JSON.stringify(req.params.id)}`)
            const sessionSittingId = req.params.id;
            const manageSession = await ManageSessions.findByPk(sessionSittingId);
            if (!manageSession) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const attendance = await manageSessionsService.markSessionSittingAttendance(req.body, sessionSittingId);
            logger.info(`Attendance Marked Successfully for Session Sitting ${sessionSittingId}!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Marked Successfully for Session Sitting!",
                data: attendance,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Mark Session Sitting Attendance
    markSessionSittingAttendanceToLeave: async (req, res) => {
        try {
            logger.info(`manageSessionController: markSessionSittingAttendanceToLeave query ${JSON.stringify(req.query)}`)
            const { sessionId, sittingId, memberId, attendanceStatus, startDay, endDay } = req.query;
            // Validate input combinations
            const hasAll = sessionId && sittingId && memberId && attendanceStatus;
            const hasNoSittingDays = sessionId && memberId && attendanceStatus && !sittingId;
            const hasNoSessionSitting = startDay && endDay && memberId && attendanceStatus && !sessionId && !sittingId
            if (!hasAll && !hasNoSittingDays && !hasNoSessionSitting) {
                throw new Error("Invalid query parameters. Please provide a valid combination of parameters.");
            }
            let attendance

            if (hasAll) {
                attendance = await manageSessionsService.markSessionSittingAttendanceToLeave(sessionId, sittingId, memberId, attendanceStatus);
            } else if (hasNoSittingDays) {
                attendance = await manageSessionsService.markSessionAttendanceToLeave(sessionId, memberId, attendanceStatus);
            }
            else if (hasNoSessionSitting) {
                attendance = await manageSessionsService.markSessionsDaysAttendanceToLeave(startDay, endDay, memberId, attendanceStatus);
            }
            logger.info(`Attendance Marked To Leave Successfully for Session Sitting!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Marked To Leave Successfully for Session Sitting!",
                data: attendance,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Session Sitting Attendance
    getSessionSittingAttendance: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSessionSittingAttendance id ${JSON.stringify(req.params.id)}`)
            const sessionSittingId = req.params.id;
            const manageSession = await ManageSessions.findByPk(sessionSittingId);
            if (!manageSession) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const attendance = await manageSessionsService.getSessionSittingAttendance(sessionSittingId);
            logger.info(`Attendance Retrieved Successfully for Session Sitting ${sessionSittingId}!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Retrieved Successfully for Session Sitting!",
                data: attendance,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Session Sitting Attendance Province Wise
    getSessionSittingAttendanceByProvince: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSessionSittingAttendanceByProvince id ${JSON.stringify(req.params.id)}`)
            const sessionSittingId = req.params.id;
            const manageSession = await ManageSessions.findByPk(sessionSittingId);
            if (!manageSession) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const attendance = await manageSessionsService.getSessionSittingAttendanceByProvince(sessionSittingId);
            const fetchedSession = await manageSessionsService.getSingleSessionSitting(sessionSittingId);
            const pdfData = await manageSessionsService.generatePDF(attendance, fetchedSession);

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);


            const fileLink = `/assets/${fileName}`;
            logger.info(`Attendance Retrieved Successfully for Session Sitting ${sessionSittingId} Province Wise!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Retrieved Successfully for Session Sitting Province Wise!",
                data: {
                    fileLink
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

    checkForDataForAttendance: (attendance) => {
        if (attendance && attendance.length > 0) {
            for (const party of attendance) {
                for (const member of party.memberAttendanceRecords) {
                    if (member.sessions > 0 || member.sittings > 0 || Object.values(member.attendanceCounts).some(count => count > 0)) {
                        return true; // Data found
                    }
                }
            }
        }
        return false; // No data found
    },

    // Get Attendance Record for Weekly, Monthly, Yearly and Upto 3 Years
    getAttendanceRecord: async (req, res) => {
        try {
            logger.info(`manageSessionController: getAttendanceRecord query ${JSON.stringify(req.query)}`);
            const { startDay, endDay, month, year, threeYears } = req.query;

            // Validate input combinations
            const hasStartAndEndDay = startDay && endDay && !month && !year;
            const hasMonthAndYear = month && year && !startDay && !endDay;
            const hasOnlyYear = year && !month && !startDay && !endDay;
            const hasOnlyThreeYears = threeYears && !month && !year && !startDay && !endDay

            if (!hasStartAndEndDay && !hasMonthAndYear && !hasOnlyYear && !hasOnlyThreeYears) {
                throw new Error("Invalid query parameters. Please provide a valid combination of parameters.");
            }

            let attendance, pdfData;

            if (hasStartAndEndDay) {
                // Weekly attendance
                attendance = await manageSessionsService.getWeeklyAttendanceRecord(startDay, endDay);
                if (!manageSessionController.checkForDataForAttendance(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                pdfData = await manageSessionsService.generateWeeklyAttendancePDF(startDay, endDay, attendance);
            } else if (hasMonthAndYear) {
                // Monthly attendance
                attendance = await manageSessionsService.getMonthlyAttendanceRecord(month, year);
                if (!manageSessionController.checkForDataForAttendance(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                pdfData = await manageSessionsService.generateMonthlyAttendancePDF(month, year, attendance);
            } else if (hasOnlyYear) {
                // Yearly attendance
                attendance = await manageSessionsService.getYearlyAttendanceRecord(year);
                if (!manageSessionController.checkForDataForAttendance(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                } pdfData = await manageSessionsService.generateYearlyAttendancePDF(year, attendance);
            }
            else if (hasOnlyThreeYears) {
                // Upto 3 Years Attendance
                attendance = await manageSessionsService.getUpto3YearsAttendanceRecord(threeYears);
                if (!manageSessionController.checkForDataForAttendance(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                pdfData = await manageSessionsService.generateUpto3YearsAttendancePDF(threeYears, attendance)
            }
            // Generate PDF and save
            const buffer = Buffer.from(pdfData);
            const fileName = `output_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePath = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePath, buffer);

            const fileLink = `/assets/${fileName}`;

            return res.status(200).send({
                success: true,
                message: "Attendance Record Retrieved Successfully",
                data: { fileLink }
            });
        } catch (error) {
            logger.error(error.message);
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    },

    checkAttendanceResponse: (attendanceData) => {
        const hasData = Object.values(attendanceData.overallStats).some(value => value > 0);
        if (!hasData) {
            return true;
        }
    },
    // Get Attendance Record On The Basis of Party, Province or Member Name
    getAttendanceRecordByMemberName: async (req, res) => {
        try {
            logger.info(`manageSessionController: getAttendanceRecordByMemberName query ${JSON.stringify(req.query)}`);
            const { sessionId, manageSessionId, partyName, province, memberName } = req.query;

            let attendance = {}
            let pdfData;

            if (sessionId && manageSessionId && partyName && !province && !memberName) {
                // Assuming a function that fetches attendance records based on these filters
                attendance = await manageSessionsService.getSessionSittingAttendanceBySingleParty(manageSessionId, partyName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatePDFForParty(attendance, fetchedSession);

            }

            else if (sessionId && manageSessionId && province && !partyName && !memberName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceBySingleProvince(manageSessionId, province);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForSingleProvince(attendance, fetchedSession)
            }

            else if (sessionId && manageSessionId && memberName && !province && !partyName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceBySingleMember(manageSessionId, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForSingleMember(attendance, fetchedSession)

            }

            else if (sessionId && manageSessionId && partyName && province && !memberName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceByProvinceParty(manageSessionId, partyName, province);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForProvinceParty(attendance, fetchedSession)

            }
            else if (sessionId && manageSessionId && partyName && memberName && !province) {
                attendance = await manageSessionsService.getSessionSittingAttendanceByPartyMember(manageSessionId, partyName, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForPartyMember(attendance, fetchedSession)

            }
            else if (sessionId && manageSessionId && province && memberName && !partyName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceByProvinceMember(manageSessionId, province, memberName);
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForProvinceMember(attendance, fetchedSession)

            }
            else if (sessionId && manageSessionId && province && memberName && partyName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceByPartyProvinceMember(manageSessionId, partyName, province, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForPartyProvinceMember(attendance, fetchedSession)

            }
            else if (sessionId && manageSessionId && !province && !memberName && !partyName) {
                attendance = await manageSessionsService.getSessionSittingAttendanceBySessionSitting(manageSessionId);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForSessionSitting(attendance, fetchedSession)
            }
            else if (sessionId && !manageSessionId && !province && !memberName && !partyName) {
                attendance = await manageSessionsService.getAttendanceBySession(sessionId);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
             pdfData = await manageSessionsService.generatedPDFForSession(attendance)
            }
            else if (sessionId && !manageSessionId && !province && memberName && !partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionMember(sessionId, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                //const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                //console.log(fetchedSession)
                 pdfData = await manageSessionsService.generatedPDFForSessionMember(attendance)
            }

            else if (sessionId && !manageSessionId && province && !memberName && !partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionProvince(sessionId, province);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                 pdfData = await manageSessionsService.generatedPDFForSesionProvince(attendance)
            }
            else if (sessionId && !manageSessionId && !province && !memberName && partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionParty(sessionId, partyName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                 pdfData = await manageSessionsService.generatedPDFForSesionParty(attendance)
            }
            else if (sessionId && !manageSessionId && !province && memberName && partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionMemberParty(sessionId, partyName, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                 pdfData = await manageSessionsService.generatedPDFForSessionMemberParty(attendance)
            }

            else if (sessionId && !manageSessionId && province && memberName && !partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionMemberProvince(sessionId, province, memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                 pdfData = await manageSessionsService.generatedPDFForSessionMemberProvince(attendance)
            }
            else if (sessionId && !manageSessionId && province && !memberName && partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionPartyProvince(sessionId, province, partyName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
                pdfData = await manageSessionsService.generatedPDFForSessionPartyProvince(attendance)
            }
            else if (sessionId && !manageSessionId && province && memberName && partyName) {
                attendance = await manageSessionsService.getAttendanceBySessionMemberPartyProvince(sessionId, province, partyName,memberName);
                if (manageSessionController.checkAttendanceResponse(attendance)) {
                    logger.info("No Data Found!")
                    return res.status(200).send({
                        success: true, message: "No Data Found!"
                    });
                }
                // const fetchedSession = await manageSessionsService.getSingleSessionSitting(manageSessionId);
               pdfData = await manageSessionsService.generatedPDFForSessionMemberPartyProvince(attendance)
            }
            //Generate PDF based on the filtered attendance records
            const buffer = Buffer.from(pdfData);
            const fileName = `output_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');
            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }
            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);
            // Provide a link
            const fileLink = `/assets/${fileName}`;
            return res.status(200).send({
                success: true,
                message: "Attendance Record Retrieved Successfully",
                data: { attendance, fileLink}
            });

        } catch (error) {
            logger.error(`Error in getAttendanceRecordByMemberName: ${error.message}`);
            return res.status(500).send({
                success: false,
                message: "Error Retrieving Attendance Record"
            });
        }
    },

    // Get Attendance Record For Senators Of A Party (Yearly)
    getYearlyAttendanceRecord: async (req, res) => {
        try {
            // console.log("come")
            logger.info(`manageSessionController: getYearlyAttendanceRecord query ${JSON.stringify(req.query)}`)

            const year = req.query.year
            const partyName = req.query.partyName
            const attendance = await manageSessionsService.getYearlyAttendanceRecord(year, partyName);

            const pdfData = await manageSessionsService.generateYearlyAttendancePDF(year, attendance);

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);


            const fileLink = `/assets/${fileName}`;
            // logger.info(`Attendance Retrieved Successfully for Session Sitting ${sessionSittingId} Province Wise!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Record Retrieved Successfully",
                data: {
                    fileLink
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

    // Get Attendance Record For Senators Of A Party (Upto 3 Years)
    getUpto3YearsAttendanceRecord: async (req, res) => {
        try {
            logger.info(`manageSessionController: getUpto3YearsAttendanceRecord query ${JSON.stringify(req.query)}`)
            const year = req.query.year
            const partyName = req.query.partyName
            const attendance = await manageSessionsService.getUpto3YearsAttendanceRecord(year, partyName);
            logger.info(`Attendance Record Retrieved Successfully!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Record Retrieved Successfully!",
                data: attendance,
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Session Sitting Attendance By Single Province 
    getSessionSittingAttendanceBySingleProvince: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSessionSittingAttendanceBySingleProvince id ${JSON.stringify(req.params.id)} and query${JSON.stringify(req.query)}`)
            const sessionSittingId = req.params.id;
            const province = req.query.province;
            const manageSession = await ManageSessions.findByPk(sessionSittingId);
            if (!manageSession) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const attendance = await manageSessionsService.getSessionSittingAttendanceBySingleProvince(sessionSittingId, province);
            const fetchedSession = await manageSessionsService.getSingleSessionSitting(sessionSittingId);
            const pdfData = await manageSessionsService.generatedPDF(attendance, fetchedSession);

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;



            logger.info(`Attendance Retrieved Successfully for Session Sitting ${sessionSittingId} Province Wise!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Retrieved Successfully for Session Sitting Province Wise!",
                data: { fileLink }
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

    // Get Session Sitting Attendance By Single Party
    getSessionSittingAttendanceBySingleParty: async (req, res) => {
        try {
            logger.info(`manageSessionController: getSessionSittingAttendanceBySingleParty id ${JSON.stringify(req.params.id)} and query${JSON.stringify(req.query)}`)
            const sessionSittingId = req.params.id;
            const partyName = req.query.partyName;
            const manageSession = await ManageSessions.findByPk(sessionSittingId);
            if (!manageSession) {
                logger.info("Session Sitting Not Found!")
                return res.status(200).send({
                    success: true,
                    message: "Session Sitting Not Found!",
                })
            }
            const partyData = await manageSessionsService.getSessionSittingAttendanceBySingleParty(sessionSittingId, partyName);
            // const fetchedSession = await manageSessionsService.getSingleSessionSitting(sessionSittingId);
            const pdfData = await manageSessionsService.generatePDFForParty(partyData, partyName);

            const buffer = Buffer.from(pdfData);
            console.log("buffer--", buffer)

            const fileName = `output_${Date.now()}.pdf`;
            console.log("fileName--", fileName)

            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');


            console.log("pdfDirectory---", pdfDirectory)

            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }

            const filePathh = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePathh, buffer);

            // Provide a link
            const fileLink = `/assets/${fileName}`;



            logger.info(`Attendance Retrieved Successfully for Session Sitting ${sessionSittingId} Province Wise!`)
            return res.status(200).send({
                success: true,
                message: "Attendance Retrieved Successfully for Session Sitting Party Wise!",
                data: { fileLink }
            })
        } catch (error) {
            logger.error(error.message)
            return res.status(400).send({
                success: false,
                message: error.message
            })
        }
    },

}


module.exports = manageSessionController