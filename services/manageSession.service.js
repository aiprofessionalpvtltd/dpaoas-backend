const db = require("../models");
const ManageSessions = db.manageSessions;
const Sessions = db.sessions
const SessionAttendance = db.sessionAttendances
const SessionMemberDetails = db.sessionMemberDetails
const SessionBreakDetails = db.sessionBreakDetails
const PoliticalParties = db.politicalParties
const Members = db.members
const Op = db.Sequelize.Op;
const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
const fs = require('fs').promises;
const logger = require('../common/winston');
const moment = require('moment');

const manageSessionsService = {
    // Create Session Sitting
    createSessionSitting: async (req) => {
        try {
            // Push session member details in the array
            const sessionMemberDetailsData = [];
            if (Array.isArray(req.sessionMembers)) {
                req.sessionMembers.forEach(member => {
                    sessionMemberDetailsData.push({
                        fkMemberId: member.fkMemberId,
                        startTime: member.startTime,
                        endTime: member.endTime
                    });
                });
            }
            const sessionBreakDetailsData = [];
            if (Array.isArray(req.sessionBreaks)) {
                req.sessionBreaks.forEach(breaks => {
                    sessionBreakDetailsData.push({
                        breakStartTime: breaks.breakStartTime,
                        breakEndTime: breaks.breakEndTime
                    });
                });
            }
            // Create session member details 
            const sessionMemberDetails = await Promise.all(sessionMemberDetailsData.map(data =>
                SessionMemberDetails.create(data)
            ));
            // Create session break details 
            const sessionBreakDetails = await Promise.all(sessionBreakDetailsData.map(data =>
                SessionBreakDetails.create(data)
            ));

            const sessionMemberIds = sessionMemberDetails.map(member => ({ fkSessionMemberId: member.id }));
            const sessionBreakIds = sessionBreakDetails.map(breaks => ({ fkSessionBreakId: breaks.id }))
            const manageSessionData = {
                fkSessionId: req.fkSessionId,
                fkSessionMemberId: sessionMemberIds.map(sessionMember => sessionMember.fkSessionMemberId),
                sessionAdjourned: req.sessionAdjourned,
                sittingDate: req.sittingDate,
                sittingStartTime: req.sittingStartTime,
                sittingEndTime: req.sittingEndTime,
                fkSessionBreakId: sessionBreakIds.map(sessionBreak => sessionBreak.fkSessionBreakId),
                committeeWhole: req.committeeWhole,
                committeeStartTime: req.committeeStartTime,
                committeeEndTime: req.committeeEndTime
            };
            // Create the session sitting and save it in the database
            const sessionSitting = await ManageSessions.create(manageSessionData);
            const fkSessionSittingId = sessionSitting.id;
            const sessionMemberDetailsIds = sessionMemberDetails.map(member => member.id);
            const sessionMemberDetailsToUpdate = await SessionMemberDetails.findAll({
                where: { id: sessionMemberDetailsIds }
            });
            const sessionBreakDetailsIds = sessionBreakDetails.map(breaks => breaks.id);
            const sessionBreakDetailsToUpdate = await SessionBreakDetails.findAll({
                where: { id: sessionBreakDetailsIds }
            });
            // Update each sessionMemberDetails record 
            await Promise.all(sessionMemberDetailsToUpdate.map(member => member.update({ fkSessionSittingId })));
            await Promise.all(sessionBreakDetailsToUpdate.map(breaks => breaks.update({ fkSessionSittingId })))
            return sessionSitting;
        } catch (error) {
            throw { message: error.message || "Error Creating Session Sitting!" };
        }
    },

    convertToWords: async (number) => {
        const units = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
        const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        if (number < 10) {
            return units[number];
        } else if (number < 20) {
            return teens[number - 10];
        } else {
            const tensDigit = Math.floor(number / 10);
            const unitsDigit = number % 10;
            return `${tens[tensDigit]} ${units[unitsDigit]}`.trim();
        }
    },

    minutesToWords: async (minutes) => {
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;

        let result = '';

        if (hours > 0) {
            result += `${await manageSessionsService.convertToWords(hours)} hour${hours > 1 ? 's' : ''}`;
            if (remainingMinutes > 0) {
                result += ' and ';
            }
        }

        if (remainingMinutes > 0) {
            result += `${await manageSessionsService.convertToWords(remainingMinutes)} minute${remainingMinutes > 1 ? 's' : ''}`;
        }

        return result;
    },


    // Get All Session Sittings
    getAllSessionSittings: async (year) => {
        try {
            const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
            const endDate = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');

            // const offset = currentPage * pageSize;
            // const limit = pageSize;
            const { count, rows } = await ManageSessions.findAndCountAll({
                include: [
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName'],
                        where: {
                            startDate: {
                                [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                            }
                        }
                    },
                ],
                // offset,
                //  limit,
                order: [
                    ['id', 'DESC']
                ]
            });


            const sessionSittings = await Promise.all(rows.map(async (session) => {
                const sittingStartTime = moment(session.sittingStartTime, "h:mm A");
                const sessionEndTime = moment(session.sittingEndTime, "h:mm A");
                const sessionDuration = moment.duration(sessionEndTime.diff(sittingStartTime));
                const sessionMinutes = sessionDuration.asMinutes();
                const sessionTotalTime = `${Math.floor(sessionMinutes / 60)}h:${sessionMinutes % 60}m`;
                const sessionTotalDuration = await manageSessionsService.minutesToWords(sessionMinutes)
                let sessionMemberDetails = [];
                if (session.fkSessionMemberId && session.fkSessionMemberId.length > 0) {
                    sessionMemberDetails = await Promise.all(session.fkSessionMemberId.map(async (sessionId) => {
                        const sessionData = await SessionMemberDetails.findByPk(sessionId);
                        if (sessionData) {
                            const memberData = await Members.findByPk(sessionData.fkMemberId);
                            const memberName = memberData ? memberData.memberName : null;
                            const memberStartTime = moment(sessionData.startTime, "h:mm A");
                            const memberEndTime = moment(sessionData.endTime, "h:mm A");
                            const memberDuration = moment.duration(memberEndTime.diff(memberStartTime));
                            const memberMinutes = memberDuration.asMinutes();
                            const memberTotalTime = `${Math.floor(memberMinutes / 60)}h:${memberMinutes % 60}m`;
                            const durationInWords = await manageSessionsService.minutesToWords(memberMinutes);
                            //  const memberDurationInWords = convertDurationToWords(memberMinutes);
                            //   return { id: sessionId, fkMemberId: sessionData.fkMemberId, startTime: sessionData.startTime, endTime: sessionData.endTime, memberName };
                            return {
                                id: sessionId,
                                fkMemberId: sessionData.fkMemberId,
                                startTime: sessionData.startTime, endTime: sessionData.endTime,
                                memberName,
                                totalTime: memberTotalTime,
                                totalTimeInWords: durationInWords // Total time in words
                            };
                        } else {
                            return null;
                        }
                    }));
                }

                let sessionBreakDetails = [];
                if (session.fkSessionBreakId && session.fkSessionBreakId.length > 0) {
                    sessionBreakDetails = await Promise.all(session.fkSessionBreakId.map(async (breakId) => {
                        const breakData = await SessionBreakDetails.findByPk(breakId);
                        const breakStartTime = moment(breakData.breakStartTime, "h:mm A");
                        const breakEndTime = moment(breakData.breakEndTime, "h:mm A");
                        const breakDuration = moment.duration(breakEndTime.diff(breakStartTime));
                        const breakMinutes = breakDuration.asMinutes();
                        const breakTotalTime = `${Math.floor(breakMinutes / 60)}h:${breakMinutes % 60}m`;
                        const durationInWords = await manageSessionsService.minutesToWords(breakMinutes);
                        return breakData ? {
                            id: breakId,
                            totalTime: breakTotalTime,
                            totalTimeInWords: durationInWords,
                            breakStartTime: breakData.breakStartTime, breakEndTime: breakData.breakEndTime
                        } : null;
                    }));
                }

                return {
                    ...session.toJSON(),
                    sessionDuration: sessionTotalTime,
                    totalTimeInWords: sessionTotalDuration,
                    sessionMembers: sessionMemberDetails.filter(detail => detail !== null), // Filter out any null values
                    sessionBreaks: sessionBreakDetails.filter(breakDetail => breakDetail !== null) // Filter out any null values
                };
            }));

            // const totalPages = Math.ceil(count / pageSize);
            return { count, sessionSittings };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Session Sittings");
        }
    },

    //getUpto3YearsSessionSittings
    getUpto3YearsSessionSittings: async (startYear) => {
        try {
            let allSessionSittings = [];

            for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
                const year = parseInt(startYear) + yearOffset;
                const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
                const endDate = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');

                const { count, rows } = await ManageSessions.findAndCountAll({
                    include: [
                        {
                            model: Sessions,
                            attributes: ['id', 'sessionName'],
                            where: {
                                startDate: {
                                    [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                                }
                            }
                        },
                    ],
                    order: [['id', 'DESC']]
                });

                const sessionSittings = await Promise.all(rows.map(async (session) => {
                    const sittingStartTime = moment(session.sittingStartTime, "h:mm A");
                    const sessionEndTime = moment(session.sittingEndTime, "h:mm A");
                    const sessionDuration = moment.duration(sessionEndTime.diff(sittingStartTime));
                    const sessionMinutes = sessionDuration.asMinutes();
                    const sessionTotalTime = `${Math.floor(sessionMinutes / 60)}h:${sessionMinutes % 60}m`;
                    const sessionTotalDuration = await manageSessionsService.minutesToWords(sessionMinutes)
                    let sessionMemberDetails = [];
                    if (session.fkSessionMemberId && session.fkSessionMemberId.length > 0) {
                        sessionMemberDetails = await Promise.all(session.fkSessionMemberId.map(async (sessionId) => {
                            const sessionData = await SessionMemberDetails.findByPk(sessionId);
                            if (sessionData) {
                                const memberData = await Members.findByPk(sessionData.fkMemberId);
                                const memberName = memberData ? memberData.memberName : null;
                                const memberStartTime = moment(sessionData.startTime, "h:mm A");
                                const memberEndTime = moment(sessionData.endTime, "h:mm A");
                                const memberDuration = moment.duration(memberEndTime.diff(memberStartTime));
                                const memberMinutes = memberDuration.asMinutes();
                                const memberTotalTime = `${Math.floor(memberMinutes / 60)}h:${memberMinutes % 60}m`;
                                const durationInWords = await manageSessionsService.minutesToWords(memberMinutes);
                                //  const memberDurationInWords = convertDurationToWords(memberMinutes);
                                //   return { id: sessionId, fkMemberId: sessionData.fkMemberId, startTime: sessionData.startTime, endTime: sessionData.endTime, memberName };
                                return {
                                    id: sessionId,
                                    fkMemberId: sessionData.fkMemberId,
                                    startTime: sessionData.startTime, endTime: sessionData.endTime,
                                    memberName,
                                    totalTime: memberTotalTime,
                                    totalTimeInWords: durationInWords // Total time in words
                                };
                            } else {
                                return null;
                            }
                        }));
                    }

                    let sessionBreakDetails = [];
                    if (session.fkSessionBreakId && session.fkSessionBreakId.length > 0) {
                        sessionBreakDetails = await Promise.all(session.fkSessionBreakId.map(async (breakId) => {
                            const breakData = await SessionBreakDetails.findByPk(breakId);
                            const breakStartTime = moment(breakData.breakStartTime, "h:mm A");
                            const breakEndTime = moment(breakData.breakEndTime, "h:mm A");
                            const breakDuration = moment.duration(breakEndTime.diff(breakStartTime));
                            const breakMinutes = breakDuration.asMinutes();
                            const breakTotalTime = `${Math.floor(breakMinutes / 60)}h:${breakMinutes % 60}m`;
                            const durationInWords = await manageSessionsService.minutesToWords(breakMinutes);
                            return breakData ? {
                                id: breakId,
                                totalTime: breakTotalTime,
                                totalTimeInWords: durationInWords,
                                breakStartTime: breakData.breakStartTime, breakEndTime: breakData.breakEndTime
                            } : null;
                        }));
                    }

                    return {
                        ...session.toJSON(),
                        sessionDuration: sessionTotalTime,
                        totalTimeInWords: sessionTotalDuration,
                        sessionMembers: sessionMemberDetails.filter(detail => detail !== null), // Filter out any null values
                        sessionBreaks: sessionBreakDetails.filter(breakDetail => breakDetail !== null) // Filter out any null values
                    };
                }));
                console.log(sessionSittings)
                allSessionSittings.push(...sessionSittings);
            }
            return allSessionSittings;
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Session Sittings");
        }
    },

    // Get Single Session
    getSingleSessionSitting: async (sessionSittingId) => {
        try {
            const session = await ManageSessions.findOne({
                where: { id: sessionSittingId },
                include: [
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName']
                    },
                ],
            });

            if (!session) {
                throw new Error("Session Sitting Not Found!");
            }

            let sessionMemberDetails = [];
            if (session.fkSessionMemberId && session.fkSessionMemberId.length > 0) {
                sessionMemberDetails = await Promise.all(session.fkSessionMemberId.map(async (sessionId) => {
                    const sessionData = await SessionMemberDetails.findByPk(sessionId);
                    if (sessionData) {
                        const memberData = await Members.findByPk(sessionData.fkMemberId);
                        const memberName = memberData ? memberData.memberName : null;
                        return { id: sessionId, fkMemberId: sessionData.fkMemberId, startTime: sessionData.startTime, endTime: sessionData.endTime, memberName };
                    } else {
                        return null;
                    }
                }));
                // Filter out any null values
                sessionMemberDetails = sessionMemberDetails.filter(detail => detail !== null);
            }

            let sessionBreakDetails = [];
            if (session.fkSessionBreakId && session.fkSessionBreakId.length > 0) {
                sessionBreakDetails = await Promise.all(session.fkSessionBreakId.map(async (breakId) => {
                    const breakData = await SessionBreakDetails.findByPk(breakId);
                    return breakData ? { id: breakId, breakStartTime: breakData.breakStartTime, breakEndTime: breakData.breakEndTime } : null;
                }));
                // Filter out any null values
                sessionBreakDetails = sessionBreakDetails.filter(breakDetail => breakDetail !== null);
            }

            return {
                ...session.toJSON(),
                sessionMembers: sessionMemberDetails,
                sessionBreaks: sessionBreakDetails,
            };

        } catch (error) {
            throw new Error(error.message || "Error Fetching Session Sitting");
        }
    },

    // Update Session Sitting
    updateSessionSitting: async (req, sessionSittingId) => {
        try {
            // Update session sitting details
            await ManageSessions.update(req, { where: { id: sessionSittingId } });
            // Delete all existing session member details for the session sitting
            await SessionMemberDetails.destroy({ where: { fkSessionSittingId: sessionSittingId } });
            await SessionBreakDetails.destroy({ where: { fkSessionSittingId: sessionSittingId } })
            // Prepare new session member details
            const newSessionMemberDetails = req.sessionMembers.map(member => ({
                fkMemberId: member.fkMemberId,
                startTime: member.startTime,
                endTime: member.endTime,
                fkSessionSittingId: sessionSittingId
            }));
            const newSessionBreakDetails = req.sessionBreaks.map(member => ({

                breakStartTime: member.breakStartTime,
                breakEndTime: member.breakEndTime,
                fkSessionSittingId: sessionSittingId
            }));
            // Bulk create new session member details
            const createdDetails = await SessionMemberDetails.bulkCreate(newSessionMemberDetails);
            const createdBreakDetails = await SessionBreakDetails.bulkCreate(newSessionBreakDetails)
            const fkSessionMemberIds = createdDetails.map(detail => detail.id);
            const fkSessionBreakIds = createdBreakDetails.map(detail => detail.id)

            const updatedData = {
                fkSessionMemberId: fkSessionMemberIds,
                fkSessionBreakId: fkSessionBreakIds
            }
            await ManageSessions.update(updatedData, { where: { id: sessionSittingId } });
            const updatedSessionSitting = await ManageSessions.findOne({
                where: { id: sessionSittingId },
                include: [
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName'],
                    },
                ],
            });
            return updatedSessionSitting;
        } catch (error) {

            throw { message: error.message || "Error Updating Session Sitting!" };
        }
    },

    // Delete Session Sitting
    deleteSessionSitting: async (sessionSittingId) => {
        try {
            const updatedData = {
                status: "inactive"
            }
            await ManageSessions.update(updatedData, { where: { id: sessionSittingId } });
            // Fetch the updated session sitting after the update
            const updatedSession = await ManageSessions.findOne({
                where: { id: sessionSittingId },
                include: [
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName']
                    },
                ],
            });
            return updatedSession;
        } catch (error) {
            throw { message: error.message || "Error Deleting Session Sitting!" };
        }
    },

    //Get Session Sittings On Session Id
    getSessionSittingsBySessionId: async (sessionId, currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await ManageSessions.findAndCountAll({
                where: { fkSessionId: sessionId },
                include: [
                    {
                        model: Sessions,
                        attributes: ['id', 'sessionName']
                    },
                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC']
                ]
            });
            if (!rows) {
                throw ({ message: "Session Sittings Not Found!" })
            }
            const sessionSittings = await Promise.all(rows.map(async (session) => {
                let sessionMemberDetails = [];
                if (session.fkSessionMemberId && session.fkSessionMemberId.length > 0) {
                    sessionMemberDetails = await Promise.all(session.fkSessionMemberId.map(async (sessionId) => {
                        const sessionData = await SessionMemberDetails.findByPk(sessionId);
                        if (sessionData) {
                            const memberData = await Members.findByPk(sessionData.fkMemberId);
                            const memberName = memberData ? memberData.memberName : null;
                            return { id: sessionId, fkMemberId: sessionData.fkMemberId, startTime: sessionData.startTime, endTime: sessionData.endTime, memberName };
                        } else {
                            return null;
                        }
                    }));
                }

                let sessionBreakDetails = [];
                if (session.fkSessionBreakId && session.fkSessionBreakId.length > 0) {
                    sessionBreakDetails = await Promise.all(session.fkSessionBreakId.map(async (breakId) => {
                        const breakData = await SessionBreakDetails.findByPk(breakId);
                        return breakData ? { id: breakId, breakStartTime: breakData.breakStartTime, breakEndTime: breakData.breakEndTime } : null;
                    }));
                }

                return {
                    ...session.toJSON(),
                    sessionMembers: sessionMemberDetails.filter(detail => detail !== null), // Filter out any null values
                    sessionBreaks: sessionBreakDetails.filter(breakDetail => breakDetail !== null) // Filter out any null values
                };
            }));

            const totalPages = Math.ceil(count / pageSize);
            return { count, totalPages, sessionSittings };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Session Sittings");

        }
    },

    // Mark Session Sitting Attendance
    markSessionSittingAttendance: async (req, sessionSittingId) => {
        try {
            // Fetch all existing attendance records for the session
            const existingAttendances = await SessionAttendance.findAll({
                where: { fkManageSessionId: sessionSittingId },
                attributes: ['id', 'fkMemberId', 'attendanceStatus']
            });

            // Convert existing attendances to a map for efficient lookup
            const attendanceMap = new Map(existingAttendances.map(att => [att.fkMemberId, att]));

            // Process each attendance record in the request body
            for (const record of req) {
                const existingAttendance = attendanceMap.get(record.fkMemberId);
                // Update only if the attendance status is different
                if (existingAttendance && existingAttendance.attendanceStatus !== record.attendanceStatus) {
                    await SessionAttendance.update(
                        {
                            attendanceStatus: record.attendanceStatus
                        },
                        { where: { id: existingAttendance.id } }
                    );
                }
                else if (!existingAttendance) {
                    // Create new attendance record if it doesn't exist
                    await SessionAttendance.create({
                        fkManageSessionId: sessionSittingId,
                        fkMemberId: record.fkMemberId,
                        attendanceStatus: record.attendanceStatus
                    });
                }
            }
            // Fetch and return the updated list of attendances
            const updatedAttendances = await SessionAttendance.findAll({
                where: { fkManageSessionId: sessionSittingId },
                attributes: ['id', 'fkMemberId', 'attendanceStatus']
            });
            return updatedAttendances;

        } catch (error) {
            throw { message: error.message || "Error Marking Attendance!" };
        }
    },

    // Get Session Sitting Attendance
    getSessionSittingAttendance: async (sessionSittingId) => {
        try {
            // Fetch all members
            const allMembers = await Members.findAll({
                attributes: ['id', 'memberName'],
                include: [
                    {
                        model: PoliticalParties,
                        as: 'politicalParties',
                        attributes: ['id', 'partyName', 'shortName']
                    }
                ]
            });
            const attendanceData = [];
            for (const member of allMembers) {
                // Fetch the attendance record for the current member and session
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: sessionSittingId,
                        fkMemberId: member.id,

                    },
                    attributes: ['attendanceStatus'],
                });
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
                attendanceData.push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                    partyName: member.politicalParties.partyName,
                    shortName: member.politicalParties.shortName
                });
            }
            return attendanceData;
        } catch (error) {
            throw { message: error.message || "Error Retrieving Attendance!" };
        }
    },

    // Get Session Sitting Attendance Province Wise
    getSessionSittingAttendanceByProvince: async (sessionSittingId) => {
        try {
            // Define the provinces
            const provinces = ['Balochistan', 'Punjab', 'Khyber Pakhtunkhwa', 'Sindh', 'Erstwhile FATA', 'Federal Capital Area Islamabad'];
            const attendanceDataByProvince = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            for (const province of provinces) {
                const membersInProvince = await Members.findAll({
                    where: { memberProvince: province },
                    attributes: ['id', 'memberName', 'memberProvince'],
                });

                // Initialize the array for the current province's attendance data
                attendanceDataByProvince[province] = [];

                // Fetch attendance for each member in the province
                for (const member of membersInProvince) {
                    const attendanceRecord = await SessionAttendance.findOne({
                        where: {
                            fkManageSessionId: sessionSittingId,
                            fkMemberId: member.id,
                        },
                        attributes: ['attendanceStatus'],
                    });

                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
                    // Add the member's attendance data to the province's array
                    attendanceDataByProvince[province].push({
                        memberId: member.id,
                        memberName: member.memberName,
                        attendanceStatus: attendanceStatus,
                    });

                    // Update overall stats
                    if (overallStats.hasOwnProperty(attendanceStatus)) {
                        overallStats[attendanceStatus]++;
                    } else {
                        overallStats[attendanceStatus] = 1;
                    }
                    overallStats.Total++;
                }
            }
            // Combine province-wise data and overall stats
            const response = {
                ...attendanceDataByProvince,
                overallStats,
            };

            return response;
        } catch (error) {
            throw { message: error.message || "Error Retrieving Attendance By Province!" };
        }
    },

    // Get Attendance Record For Senators Of A Party (Weekly)
    getWeeklyAttendanceRecord: async (startDay, endDay) => {
        try {
            let politicalParties;
            const startDate = moment(startDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
            const endDate = moment(endDay, 'DD-MM-YYYY').format('YYYY-MM-DD');



            // Fetch all political parties
            politicalParties = await PoliticalParties.findAll({
                attributes: ['id', 'partyName', 'shortName'],
            });

            // politicalParties = [politicalParty];
            // Fetch sessions within the specified date range
            const sessions = await Sessions.findAndCountAll({
                where: {
                    startDate: {
                        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            });
            const sessionIds = sessions.rows.map(session => session.id);
            // Fetch managed sessions for the found sessions
            const manageSessions = await ManageSessions.findAndCountAll({
                where: { fkSessionId: sessionIds }
            });
            const manageSessionIds = manageSessions.rows.map(session => session.id);

            const politicalPartyRecords = await Promise.all(politicalParties.map(async (party) => {
                // Find members belonging to the current political party
                const members = await Members.findAll({
                    where: { politicalParty: party.id },
                    include: [
                        {
                            model: PoliticalParties,
                            as: 'politicalParties',
                            attributes: ['id', 'shortName', 'partyName']
                        }
                    ]
                });

                // Calculate attendance records for each member
                const memberAttendanceRecords = await Promise.all(members.map(async (member) => {
                    const attendanceRecords = await SessionAttendance.findAll({
                        where: {
                            fkManageSessionId: manageSessionIds,
                            fkMemberId: member.id
                        }
                    });
                    // Aggregate attendance statuses
                    const attendanceCounts = { Present: manageSessions.count, Absent: 0, Leave: 0, Suspended: 0, 'Oath Not Taken': 0 };
                    // If there are no manageSessions, set all attendance counts to 0
                    if (manageSessions.count === 0) {
                        for (let status in attendanceCounts) {
                            attendanceCounts[status] = 0;
                        }
                    } else {
                        // Adjust attendance counts based on attendance records
                        attendanceRecords.forEach(record => {
                            if (record.attendanceStatus !== 'Present') {
                                attendanceCounts['Present']--;
                                if (attendanceCounts.hasOwnProperty(record.attendanceStatus)) {
                                    attendanceCounts[record.attendanceStatus]++;
                                }
                            }
                        });
                    }
                    return {
                        memberId: member.id,
                        memberName: member.memberName,
                        sessions: sessions.count,
                        sittings: manageSessions.count,
                        attendanceCounts
                    };
                }));

                return {
                    id: party.id,
                    partyName: party.partyName,
                    shortName: party.shortName,
                    memberAttendanceRecords
                };
            }));

            // Directly return the array of political party records
            return politicalPartyRecords;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Weekly Attendance Record");
        }
    },

    // Get Attendance Record For Senators Of A Party (Monthly)
    getMonthlyAttendanceRecord: async (month, year) => {
        try {
            let politicalParties;
            const startDate = moment(`${year}-${month}-01`).startOf('month').format('YYYY-MM-DD');
            const endDate = moment(`${year}-${month}-01`).endOf('month').format('YYYY-MM-DD');



            // Fetch all political parties
            politicalParties = await PoliticalParties.findAll({
                attributes: ['id', 'partyName', 'shortName'],
            });


            //  politicalParties = [politicalParties];


            // Fetch sessions within the specified date range
            const sessions = await Sessions.findAndCountAll({
                where: {
                    startDate: {
                        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            });
            const sessionIds = sessions.rows.map(session => session.id);
            // Fetch managed sessions for the found sessions
            const manageSessions = await ManageSessions.findAndCountAll({
                where: { fkSessionId: sessionIds }
            });
            const manageSessionIds = manageSessions.rows.map(session => session.id);

            const politicalPartyRecords = await Promise.all(politicalParties.map(async (party) => {
                // Find members belonging to the current political party
                const members = await Members.findAll({
                    where: { politicalParty: party.id },
                    include: [
                        {
                            model: PoliticalParties,
                            as: 'politicalParties',
                            attributes: ['id', 'shortName', 'partyName']
                        }
                    ]
                });

                // Calculate attendance records for each member
                const memberAttendanceRecords = await Promise.all(members.map(async (member) => {
                    const attendanceRecords = await SessionAttendance.findAll({
                        where: {
                            fkManageSessionId: manageSessionIds,
                            fkMemberId: member.id
                        }
                    });
                    // Aggregate attendance statuses
                    const attendanceCounts = { Present: manageSessions.count, Absent: 0, Leave: 0, Suspended: 0, 'Oath Not Taken': 0 };
                    // If there are no manageSessions, set all attendance counts to 0
                    if (manageSessions.count === 0) {
                        for (let status in attendanceCounts) {
                            attendanceCounts[status] = 0;
                        }
                    } else {
                        // Adjust attendance counts based on attendance records
                        attendanceRecords.forEach(record => {
                            if (record.attendanceStatus !== 'Present') {
                                attendanceCounts['Present']--;
                                if (attendanceCounts.hasOwnProperty(record.attendanceStatus)) {
                                    attendanceCounts[record.attendanceStatus]++;
                                }
                            }
                        });
                    }

                    return {
                        memberId: member.id,
                        memberName: member.memberName,
                        sessions: sessions.count,
                        sittings: manageSessions.count,
                        attendanceCounts
                    };
                }));

                return {
                    id: party.id,
                    partyName: party.partyName,
                    shortName: party.shortName,
                    memberAttendanceRecords
                };
            }));

            // Directly return the array of political party records
            return politicalPartyRecords;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Weekly Attendance Record");
        }
    },

    // Get Attendance Record For Senators Of A Party (Monthly)
    getYearlyAttendanceRecord: async (year) => {
        try {
            let politicalParties;
            const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
            const endDate = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');
            // if (!partyName) {
            // Fetch all political parties
            politicalParties = await PoliticalParties.findAll({
                attributes: ['id', 'partyName', 'shortName'],
            });
            // } else {
            //     // Find the specified political party by name
            //     const politicalParty = await PoliticalParties.findOne({
            //         where: { id: partyName }, // Assuming you want to find by partyName, not id
            //         attributes: ['id', 'partyName', 'shortName'],
            //     });
            //     if (!politicalParty) {
            //         throw new Error("Political Party Not Found!");
            //     }
            //     politicalParties = [politicalParty];
            // }

            // Fetch sessions within the specified date range
            const sessions = await Sessions.findAndCountAll({
                where: {
                    startDate: {
                        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            });
            const sessionIds = sessions.rows.map(session => session.id);
            // Fetch managed sessions for the found sessions
            const manageSessions = await ManageSessions.findAndCountAll({
                where: { fkSessionId: sessionIds }
            });
            const manageSessionIds = manageSessions.rows.map(session => session.id);

            const politicalPartyRecords = await Promise.all(politicalParties.map(async (party) => {
                // Find members belonging to the current political party
                const members = await Members.findAll({
                    where: { politicalParty: party.id },
                    include: [
                        {
                            model: PoliticalParties,
                            as: 'politicalParties',
                            attributes: ['id', 'shortName', 'partyName']
                        }
                    ]
                });

                // Calculate attendance records for each member
                const memberAttendanceRecords = await Promise.all(members.map(async (member) => {
                    const attendanceRecords = await SessionAttendance.findAll({
                        where: {
                            fkManageSessionId: manageSessionIds,
                            fkMemberId: member.id
                        }
                    });
                    // Aggregate attendance statuses
                    const attendanceCounts = { Present: manageSessions.count, Absent: 0, Leave: 0, Suspended: 0, 'Oath Not Taken': 0 };
                    // If there are no manageSessions, set all attendance counts to 0
                    if (manageSessions.count === 0) {
                        for (let status in attendanceCounts) {
                            attendanceCounts[status] = 0;
                        }
                    } else {
                        // Adjust attendance counts based on attendance records
                        attendanceRecords.forEach(record => {
                            if (record.attendanceStatus !== 'Present') {
                                attendanceCounts['Present']--;
                                if (attendanceCounts.hasOwnProperty(record.attendanceStatus)) {
                                    attendanceCounts[record.attendanceStatus]++;
                                }
                            }
                        });
                    }

                    return {
                        memberId: member.id,
                        memberName: member.memberName,
                        sessions: sessions.count,
                        sittings: manageSessions.count,
                        attendanceCounts
                    };
                }));

                return {
                    id: party.id,
                    partyName: party.partyName,
                    shortName: party.shortName,
                    memberAttendanceRecords
                };
            }));

            // Directly return the array of political party records
            return politicalPartyRecords;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Weekly Attendance Record");
        }
    },

    // Get Attendance Record For Senators Of A Party (Upto 3 Years)
    getUpto3YearsAttendanceRecord: async (startYear, partyName) => {
        try {
            let politicalParties;
            let allYearsData = [];

            for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
                const year = parseInt(startYear) + yearOffset;
                const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
                const endDate = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');

                if (!partyName) {
                    politicalParties = await PoliticalParties.findAll({
                        attributes: ['id', 'partyName', 'shortName'],
                    });
                } else if (yearOffset === 0) { // Fetch once if partyName is specified
                    const politicalParty = await PoliticalParties.findOne({
                        where: { id: partyName },
                        attributes: ['id', 'partyName', 'shortName'],
                    });
                    if (!politicalParty) {
                        throw new Error("Political Party Not Found!");
                    }
                    politicalParties = [politicalParty];
                }

                const sessions = await Sessions.findAndCountAll({
                    where: {
                        startDate: {
                            [Op.between]: [startDate, `${endDate} 23:59:59`]
                        }
                    }
                });
                const sessionIds = sessions.rows.map(session => session.id);

                const manageSessions = await ManageSessions.findAndCountAll({
                    where: { fkSessionId: sessionIds }
                });
                const manageSessionIds = manageSessions.rows.map(session => session.id);

                const yearData = await Promise.all(politicalParties.map(async (party) => {
                    const members = await Members.findAll({
                        where: { politicalParty: party.id },
                        include: [{
                            model: PoliticalParties,
                            as: 'politicalParties',
                            attributes: ['id', 'shortName', 'partyName']
                        }]
                    });

                    const memberAttendanceRecords = await Promise.all(members.map(async (member) => {
                        const attendanceRecords = await SessionAttendance.findAll({
                            where: {
                                fkManageSessionId: manageSessionIds,
                                fkMemberId: member.id
                            }
                        });

                        const attendanceCounts = { Present: manageSessions.count, Absent: 0, Leave: 0, Suspended: 0, 'Oath Not Taken': 0 };
                        if (manageSessions.count === 0) {
                            for (let status in attendanceCounts) {
                                attendanceCounts[status] = 0;
                            }
                        } else {
                            attendanceRecords.forEach(record => {
                                if (record.attendanceStatus !== 'Present') {
                                    attendanceCounts['Present']--;
                                    if (attendanceCounts.hasOwnProperty(record.attendanceStatus)) {
                                        attendanceCounts[record.attendanceStatus]++;
                                    }
                                }
                            });
                        }

                        return {
                            memberId: member.id,
                            memberName: member.memberName,
                            sessions: sessions.count,
                            sittings: manageSessions.count,
                            attendanceCounts
                        };
                    }));

                    return {
                        year: year,
                        id: party.id,
                        partyName: party.partyName,
                        shortName: party.shortName,
                        memberAttendanceRecords
                    };
                }));

                allYearsData.push(...yearData);
            }

            return allYearsData;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Attendance Record");
        }
    },


   


    generatePDF: async (attendanceDataByProvince, fetchedSession) => {
        try {

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Embed a standard font
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


            // Add a new page to the document
            const page = pdfDoc.addPage();

            // Define basic coordinates and styling
            const fontSize = 10;


            // Add image to the page
            let yCoordinate = page.getHeight() - 50;

            // Add text to the page with a vertical gap
            const textOptions1 = { fontBold, color: rgb(0, 0, 0), size: fontSize, bold: true }
            const textOptions = { font, color: rgb(0, 0, 0), size: fontSize };

            // console.log("attendanceDataByProvince*****", fetchedSession.session.sessionName)

            const verticalGap = 10; // Adjust the gap as needed
            page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, ...textOptions1 });
            page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, ...textOptions1 });

            // sessionName
            page.drawText('SESSION:', { x: 400 + 10, y: yCoordinate + verticalGap - 30, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.session.sessionName}`, { x: 430 + 50, y: yCoordinate + verticalGap - 30, ...textOptions, })
            // sittingStartTime
            page.drawText('Commenced at:', { x: 400 + 10, y: yCoordinate + verticalGap - 50, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.sittingStartTime}`, { x: 430 + 50, y: yCoordinate + verticalGap - 50, ...textOptions, })
            // sessionAdjourned
            page.drawText('Adjourned:', { x: 400 + 10, y: yCoordinate + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.sessionAdjourned}`, { x: 430 + 50, y: yCoordinate + verticalGap - 70, ...textOptions, })

            const sittingDate = new Date(fetchedSession.sittingDate);
            const formattedDate = sittingDate.toLocaleDateString('en-GB').replace(/\//g, '-'); // 'en-GB' for the desired format

            console.log(formattedDate);
            // Subject Text
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${formattedDate}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });






            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;



            for (const provinceName in attendanceDataByProvince) {

                if (attendanceDataByProvince.hasOwnProperty(provinceName)) {
                    const provinceData = attendanceDataByProvince[provinceName];



                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData.length + 1;
                    const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

                    if (!isFirstProvince) {
                        const shouldAddPage = !isErstwhileFATA && provinceName !== 'Federal Capital Area Islamabad' && provinceName !== 'overallStats';



                        if (shouldAddPage) {
                            pdfDoc.addPage(); // Add a new page for provinces other than the first one
                        } else {
                            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap



                            // Adjust the height for Erstwhile FATA
                            if (isErstwhileFATA) {
                                console.log("daara")
                                currentYCoordinate -= 500; // Additional space for Erstwhile FATA
                                isErstwhileFATA = false; // Reset the flag after adjusting the height
                            }


                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Update isErstwhileFATA flag
                    isErstwhileFATA = provinceName === 'Erstwhile FATA';

                    // Add province name as a heading
                    const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'Federal Capital Area Islamabad') {

                        currentPage.drawText(provinceName.toUpperCase(), { x: 235, y: currentYCoordinate - 325, ...textOptions });
                    } else if (provinceName == 'overallStats') {
                        currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 525, ...textOptions });
                    } else {
                        currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    const provinceTableX = 60;
                    const provinceTableY = currentYCoordinate - 150;




                    if (provinceName == 'Federal Capital Area Islamabad') {
                        const provinceTableY = currentYCoordinate - 350;

                        for (let row = 0; row < provinceNumRows; row++) {
                            for (let col = 0; col < 3; col++) {
                                const x = provinceTableX + col * 160;
                                const y = provinceTableY - row * 20;
                                currentPage.drawRectangle({
                                    x,
                                    y,
                                    width: 160,
                                    height: 20,
                                    borderColor: rgb(0, 0, 0),
                                    borderWidth: 1,
                                });
                            }
                        }


                        currentPage.drawText('Sr No', { x: provinceTableX + 5, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                        currentPage.drawText('Member Name', { x: provinceTableX + 165, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                        currentPage.drawText('Attendance Status', { x: provinceTableX + 370, y: provinceTableY + 5, font: fontBold, ...textOptions1 });

                        // Add data to the province table cells
                        for (let row = 0; row < provinceData.length; row++) {
                            const attend = provinceData[row];
                            currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                            currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                            currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                            globalRowCounter++;
                        }
                    } else if (provinceName == 'overallStats') {
                        const provinceTableY = currentYCoordinate - 550;

                        for (let row = 0; row < provinceNumRows; row++) {
                            for (let col = 0; col < 2; col++) {
                                const x = provinceTableX + col * 130;
                                const y = provinceTableY - row * 20;
                                currentPage.drawRectangle({
                                    x,
                                    y,
                                    width: 130,
                                    height: 20,
                                    borderColor: rgb(0, 0, 0),
                                    borderWidth: 1,
                                });
                            }
                        }



                        // Add data to the province table cells
                        let row = 0; // Initialize row counter
                        for (const property in provinceData) {
                            if (provinceData.hasOwnProperty(property) && property !== 'Suspended') {
                                const columnX = provinceTableX + 280; // Initial X-coordinate for the first column
                                const y = provinceTableY - (row + 1) * 20 + 5; // Y-coordinate

                                currentPage.drawText(property, { x: columnX, y, ...textOptions }); // Draw property name
                                currentPage.drawText(String(provinceData[property]), { x: columnX + 100, y, ...textOptions }); // Draw property value as a string

                                row++; // Increment row counter
                            }
                        }

                    }
                    else {

                        // Draw table borders
                        for (let row = 0; row < provinceNumRows; row++) {
                            for (let col = 0; col < 3; col++) {
                                const x = provinceTableX + col * 160;
                                const y = provinceTableY - row * 20;
                                currentPage.drawRectangle({
                                    x,
                                    y,
                                    width: 160,
                                    height: 20,
                                    borderColor: rgb(0, 0, 0),
                                    borderWidth: 1,
                                });
                            }
                        }

                        currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });

                        // Add header text to the province table cells
                        currentPage.drawText('Sr No', { x: provinceTableX + 5, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                        currentPage.drawText('Member Name', { x: provinceTableX + 165, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                        currentPage.drawText('Attendance Status', { x: provinceTableX + 370, y: provinceTableY + 5, font: fontBold, ...textOptions1 });

                        // Add data to the province table cells
                        for (let row = 0; row < provinceData.length; row++) {
                            const attend = provinceData[row];
                            currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                            currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                            currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                            globalRowCounter++;
                        }
                    }
                }





            }
            // page.drawText('BREAK UP', { x: 400 + 10, y: yCoordinate + verticalGap - 300, font: fontBold, ...textOptions1 });

            // Save the PDF to a file with a dynamic name
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);
            //await fs.writeFile(outputFileName, pdfBytes);


            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },

    // generateWeeklyAttendancePDF: async (startDay, endDay, attendance) => {
    //     try {

    //         //console.log("attendance", attendanceDataByProvince)
    //         // console.log("attendanceDataByProvince*****", attendanceDataByProvince[province])
    //         // Create a new PDF document
    //         const pdfDoc = await PDFDocument.create();

    //         // Embed a standard font
    //         const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
    //         const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


    //         // Add a new page to the document
    //         const page = pdfDoc.addPage();

    //         // Define basic coordinates and styling
    //         const fontSize = 10;


    //         // Add image to the page
    //         const yCoordinate = page.getHeight() - 50;

    //         // Add text to the page with a vertical gap
    //         const textOptions1 = { fontBold, color: rgb(0, 0, 0), size: fontSize, bold: true }
    //         const textOptions = { font, color: rgb(0, 0, 0), size: fontSize, };

    //         // console.log("attendanceDataByProvince*****", fetchedSession.session.sessionName)

    //         const verticalGap = 10; // Adjust the gap as needed
    //         page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, ...textOptions1 });
    //         page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, ...textOptions1 });
    //         // Subject Text
    //         page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF ${attendance[0].shortName} SENATORS FOR THE PERIOD`, { x: 80, y: yCoordinate + verticalGap - 35, font: fontBold, ...textOptions1 });
    //         page.drawText(`FROM ${startDay} TILL ${endDay} DURING SENATE SESSIONS`, { x: 120, y: yCoordinate + verticalGap - 50, font: fontBold, ...textOptions1 });

    //         // page.drawText('BALOCHISTAN', { x: 290, y: yCoordinate + verticalGap - 115, ...textOptions });


    //         // Draw table for visitors
    //         // Add table borders
    //         // Assuming passVisitorData is available
    //         console.log("data", attendance[0].memberAttendanceRecords)
    //         const reocrdsAttend = attendance[0].memberAttendanceRecords;

    //         const tableX = 45;
    //         const tableY = yCoordinate + verticalGap - 90;
    //         const cellWidth = 70;
    //         const cellHeight = 20;
    //         const numRows = reocrdsAttend.length + 1; // Number of rows equals the number of visitors plus one for the header
    //         const numCols = 7; // Fixed number of columns

    //         const padding = 20;
    //         let isFirstProvince = true; // Flag to track if it's the first province
    //         let isErstwhileFATA = false;
    //         let globalRowCounter = 1;

    //         const customColWidths = [50, 140, 60, 60, 60, 60, 60];


    //         for (const provinceName in attendanceDataByProvince) {

    //             if (attendanceDataByProvince.hasOwnProperty(provinceName)) {
    //                 const provinceData = attendanceDataByProvince[provinceName];



    //                 if (provinceData.length === 0) {
    //                     // Skip drawing the table if there is no data
    //                     continue;
    //                 }

    //                 const provinceNumRows = provinceData.length + 1;
    //                 const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

    //                 if (!isFirstProvince) {
    //                     const shouldAddPage = !isErstwhileFATA && provinceName !== 'Federal Capital Area Islamabad' && provinceName !== 'overallStats';



    //                     if (shouldAddPage) {
    //                         pdfDoc.addPage(); // Add a new page for provinces other than the first one
    //                     } else {
    //                         const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
    //                         let currentYCoordinate = currentPage.getHeight() - 50;
    //                         currentYCoordinate -= padding; // Add an extra vertical gap



    //                         // Adjust the height for Erstwhile FATA
    //                         if (isErstwhileFATA) {
    //                             console.log("daara")
    //                             currentYCoordinate -= 500; // Additional space for Erstwhile FATA
    //                             isErstwhileFATA = false; // Reset the flag after adjusting the height
    //                         }


    //                     }
    //                 } else {
    //                     isFirstProvince = false; // Set the flag to false after the first province
    //                 }



    //                 // Update isErstwhileFATA flag
    //                 isErstwhileFATA = provinceName === 'Erstwhile FATA';

    //                 // Add province name as a heading
    //                 const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
    //                 let currentYCoordinate = currentPage.getHeight() - 50;
    //                 if (provinceName == 'Federal Capital Area Islamabad') {

    //                     currentPage.drawText(provinceName.toUpperCase(), { x: 235, y: currentYCoordinate - 325, ...textOptions });
    //                 } else if (provinceName == 'overallStats') {
    //                     currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 525, ...textOptions });
    //                 } else {
    //                     currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });
    //                 }


    //                 // Draw table for province
    //                 const provinceTableX = 60;
    //                 const provinceTableY = currentYCoordinate - 150;




    //                 if (provinceName == 'Federal Capital Area Islamabad') {
    //                     const provinceTableY = currentYCoordinate - 350;

    //                     for (let row = 0; row < provinceNumRows; row++) {
    //                         for (let col = 0; col < 3; col++) {
    //                             const x = provinceTableX + col * 160;
    //                             const y = provinceTableY - row * 20;
    //                             currentPage.drawRectangle({
    //                                 x,
    //                                 y,
    //                                 width: 160,
    //                                 height: 20,
    //                                 borderColor: rgb(0, 0, 0),
    //                                 borderWidth: 1,
    //                             });
    //                         }
    //                     }


    //                     currentPage.drawText('Sr No', { x: provinceTableX + 5, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
    //                     currentPage.drawText('Member Name', { x: provinceTableX + 165, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
    //                     currentPage.drawText('Attendance Status', { x: provinceTableX + 370, y: provinceTableY + 5, font: fontBold, ...textOptions1 });

    //                     // Add data to the province table cells
    //                     for (let row = 0; row < provinceData.length; row++) {
    //                         const attend = provinceData[row];
    //                         currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
    //                         currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
    //                         currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

    //                         globalRowCounter++;
    //                     }
    //                 } else if (provinceName == 'overallStats') {
    //                     const provinceTableY = currentYCoordinate - 550;

    //                     for (let row = 0; row < provinceNumRows; row++) {
    //                         for (let col = 0; col < 2; col++) {
    //                             const x = provinceTableX + col * 130;
    //                             const y = provinceTableY - row * 20;
    //                             currentPage.drawRectangle({
    //                                 x,
    //                                 y,
    //                                 width: 130,
    //                                 height: 20,
    //                                 borderColor: rgb(0, 0, 0),
    //                                 borderWidth: 1,
    //                             });
    //                         }
    //                     }



    //                     // Add data to the province table cells
    //                     let row = 0; // Initialize row counter
    //                     for (const property in provinceData) {
    //                         if (provinceData.hasOwnProperty(property) && property !== 'Suspended') {
    //                             const columnX = provinceTableX + 280; // Initial X-coordinate for the first column
    //                             const y = provinceTableY - (row + 1) * 20 + 5; // Y-coordinate

    //                             currentPage.drawText(property, { x: columnX, y, ...textOptions }); // Draw property name
    //                             currentPage.drawText(String(provinceData[property]), { x: columnX + 100, y, ...textOptions }); // Draw property value as a string

    //                             row++; // Increment row counter
    //                         }
    //                     }

    //                 }
    //                 else {

    //                     // Draw table borders
    //                     for (let row = 0; row < provinceNumRows; row++) {
    //                         for (let col = 0; col < 3; col++) {
    //                             const x = provinceTableX + col * 160;
    //                             const y = provinceTableY - row * 20;
    //                             currentPage.drawRectangle({
    //                                 x,
    //                                 y,
    //                                 width: 160,
    //                                 height: 20,
    //                                 borderColor: rgb(0, 0, 0),
    //                                 borderWidth: 1,
    //                             });
    //                         }
    //                     }

    //                     currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });

    //                     // Add header text to the province table cells
    //                     currentPage.drawText('Sr No', { x: provinceTableX + 5, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
    //                     currentPage.drawText('Member Name', { x: provinceTableX + 165, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
    //                     currentPage.drawText('Attendance Status', { x: provinceTableX + 370, y: provinceTableY + 5, font: fontBold, ...textOptions1 });

    //                     // Add data to the province table cells
    //                     for (let row = 0; row < provinceData.length; row++) {
    //                         const attend = provinceData[row];
    //                         currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
    //                         currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
    //                         currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

    //                         globalRowCounter++;
    //                     }
    //                 }
    //             }





    //         }

    //         // Draw table borders
    //         for (let row = 0; row < numRows; row++) {
    //             for (let col = 0; col < numCols; col++) {
    //                 const x = tableX + customColWidths.slice(0, col).reduce((acc, width) => acc + width, 0); // Calculate x-coordinate based on custom widths
    //                 const y = tableY - row * cellHeight;
    //                 page.drawRectangle({
    //                     x,
    //                     y,
    //                     width: customColWidths[col],
    //                     height: cellHeight,
    //                     borderColor: rgb(0, 0, 0),
    //                     borderWidth: 1,
    //                 });
    //             }
    //         }


    //         // Add header text to the table cells    
    //         page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Senators', { x: tableX + customColWidths[0] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Sessions', { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Sittings', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Presence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Leave', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
    //         page.drawText('Absence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY + 5, font: fontBold, ...textOptions1 });

    //         // Add data to the table cells
    //         for (let row = 0; row < reocrdsAttend.length; row++) {
    //             const attend = reocrdsAttend[row];

    //             page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(attend.memberName, { x: tableX + customColWidths[0] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(`${attend.sessions}`, { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(`${attend.sittings}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(`${attend.attendanceCounts.Present}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(`${attend.attendanceCounts.Leave}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //             page.drawText(`${attend.attendanceCounts.Absent}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
    //         }


    //         // Save the PDF to a file with a dynamic name
    //         const outputFileName = `output_${Date.now()}.pdf`;
    //         const pdfBytes = await pdfDoc.save(outputFileName);
    //         //await fs.writeFile(outputFileName, pdfBytes);


    //         return pdfBytes;
    //     } catch (error) {
    //         console.error('Error generating PDF:', error.message);
    //     }
    // },


    generateWeeklyAttendancePDF: async (startDay, endDay, attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const verticalGap = 10;
            const cellWidth = 70;
            const cellHeight = 20;
            const customColWidths = [50, 140, 60, 60, 60, 60, 60];

            for (const party of attendance) {
                const page = pdfDoc.addPage();
                const yCoordinate = page.getHeight() - 50;

                page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, size: 10 });
                page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, size: 10 });
                page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF ${party.shortName} SENATORS FOR THE PERIOD`, { x: 80, y: yCoordinate + verticalGap - 35, font: fontBold, size: 10 });
                page.drawText(`FROM ${startDay} TILL ${endDay} DURING SENATE SESSIONS`, { x: 120, y: yCoordinate + verticalGap - 50, font: fontBold, size: 10 });

                const tableX = 45;
                const tableY = yCoordinate + verticalGap - 90;

                // Draw table borders
                const numRows = party.memberAttendanceRecords.length + 1;
                const numCols = 7;
                for (let row = 0; row < numRows; row++) {
                    for (let col = 0; col < numCols; col++) {
                        const x = tableX + customColWidths.slice(0, col).reduce((acc, width) => acc + width, 0);
                        const y = tableY - row * cellHeight;
                        page.drawRectangle({
                            x,
                            y,
                            width: customColWidths[col],
                            height: cellHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1,
                        });
                    }
                }

                // Add header text to the table cells    
                page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Senators', { x: tableX + customColWidths[0] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sessions', { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sittings', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Presence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Leave', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Absence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY + 5, font: fontBold, size: 10 });

                // Add data to the table cells
                for (let row = 0; row < party.memberAttendanceRecords.length; row++) {
                    const attend = party.memberAttendanceRecords[row];

                    page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(attend.memberName, { x: tableX + customColWidths[0] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sessions}`, { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sittings}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Present}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Leave}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Absent}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                }
            }

            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);

            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },


    generateMonthlyAttendancePDF: async (month, year, attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const verticalGap = 10;
            const cellWidth = 70;
            const cellHeight = 20;
            const customColWidths = [50, 140, 60, 60, 60, 60, 60];

            for (const party of attendance) {
                const page = pdfDoc.addPage();
                const yCoordinate = page.getHeight() - 50;

                page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, size: 10 });
                page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, size: 10 });
                page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF ${party.shortName} SENATORS FOR THE PERIOD`, { x: 80, y: yCoordinate + verticalGap - 35, font: fontBold, size: 10 });
                page.drawText(`${month}/${year} DURING SENATE SESSIONS`, { x: 195, y: yCoordinate + verticalGap - 50, font: fontBold, size: 10 });

                const tableX = 45;
                const tableY = yCoordinate + verticalGap - 90;

                // Draw table borders
                const numRows = party.memberAttendanceRecords.length + 1;
                const numCols = 7;
                for (let row = 0; row < numRows; row++) {
                    for (let col = 0; col < numCols; col++) {
                        const x = tableX + customColWidths.slice(0, col).reduce((acc, width) => acc + width, 0);
                        const y = tableY - row * cellHeight;
                        page.drawRectangle({
                            x,
                            y,
                            width: customColWidths[col],
                            height: cellHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1,
                        });
                    }
                }

                // Add header text to the table cells    
                page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Senators', { x: tableX + customColWidths[0] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sessions', { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sittings', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Presence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Leave', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Absence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY + 5, font: fontBold, size: 10 });

                // Add data to the table cells
                for (let row = 0; row < party.memberAttendanceRecords.length; row++) {
                    const attend = party.memberAttendanceRecords[row];

                    page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(attend.memberName, { x: tableX + customColWidths[0] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sessions}`, { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sittings}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Present}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Leave}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Absent}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                }
            }

            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);

            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },

    generateYearlyAttendancePDF: async (year, attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const verticalGap = 10;
            const cellWidth = 70;
            const cellHeight = 20;
            const customColWidths = [50, 150, 60, 60, 60, 60, 60];

            for (const party of attendance) {
                const page = pdfDoc.addPage();
                const yCoordinate = page.getHeight() - 50;

                page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, size: 10 });
                page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, size: 10 });
                page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF ${party.shortName} SENATORS FOR THE PERIOD`, { x: 80, y: yCoordinate + verticalGap - 35, font: fontBold, size: 10 });
                page.drawText(`${year} DURING SENATE SESSIONS`, {  x: 195, y: yCoordinate + verticalGap - 50, font: fontBold, size: 10 });

                const tableX = 45;
                const tableY = yCoordinate + verticalGap - 90;

                // Draw table borders
                const numRows = party.memberAttendanceRecords.length + 1;
                const numCols = 7;
                for (let row = 0; row < numRows; row++) {
                    for (let col = 0; col < numCols; col++) {
                        const x = tableX + customColWidths.slice(0, col).reduce((acc, width) => acc + width, 0);
                        const y = tableY - row * cellHeight;
                        page.drawRectangle({
                            x,
                            y,
                            width: customColWidths[col],
                            height: cellHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1,
                        });
                    }
                }

                // Add header text to the table cells    
                page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Senators', { x: tableX + customColWidths[0] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sessions', { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Sittings', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Presence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Leave', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY + 5, font: fontBold, size: 10 });
                page.drawText('Absence', { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY + 5, font: fontBold, size: 10 });

                // Add data to the table cells
                for (let row = 0; row < party.memberAttendanceRecords.length; row++) {
                    const attend = party.memberAttendanceRecords[row];

                    page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(attend.memberName, { x: tableX + customColWidths[0] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sessions}`, { x: tableX + customColWidths[0] + customColWidths[1] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.sittings}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Present}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Leave}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                    page.drawText(`${attend.attendanceCounts.Absent}`, { x: tableX + customColWidths[0] + customColWidths[1] + customColWidths[2] + customColWidths[3] + customColWidths[4] + customColWidths[5] + 5, y: tableY - (row + 1) * cellHeight + 5, size: 10 });
                }
            }

            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);

            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },

    generatePDFForParty: async (partyData) => {
        try {




            //console.log("attendance", attendanceDataByProvince)
            // console.log("attendanceDataByProvince*****", attendanceDataByProvince[province])
            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Embed a standard font
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


            // Add a new page to the document
            const page = pdfDoc.addPage();

            // Define basic coordinates and styling
            const fontSize = 10;


            // Add image to the page
            const yCoordinate = page.getHeight() - 50;

            // Add text to the page with a vertical gap
            const textOptions1 = { fontBold, color: rgb(0, 0, 0), size: fontSize, bold: true }
            const textOptions = { font, color: rgb(0, 0, 0), size: fontSize, };

            // console.log("attendanceDataByProvince*****", fetchedSession.session.sessionName)

            const verticalGap = 10; // Adjust the gap as needed
            page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, ...textOptions1 });
            page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, ...textOptions1 });
            // Subject Text
            page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF ${partyData[0].shortName} SENATORS`, { x: 80, y: yCoordinate + verticalGap - 60, font: fontBold, ...textOptions1 });
            page.drawText(`DURING SENATE SESSIONS`, { x: 120, y: yCoordinate + verticalGap - 75, font: fontBold, ...textOptions1 });

            // page.drawText('BALOCHISTAN', { x: 290, y: yCoordinate + verticalGap - 115, ...textOptions });


            // Draw table for visitors
            // Add table borders
            // Assuming passVisitorData is available
            console.log("data", partyData[0].memberAttendanceRecords)
            const reocrdsAttend = partyData[0].memberAttendanceRecords;

            const tableX = 70;
            const tableY = yCoordinate + verticalGap - 150;
            const cellWidth = 60;
            const cellHeight = 20;
            const numRows = reocrdsAttend.length + 1; // Number of rows equals the number of visitors plus one for the header
            const numCols = 7; // Fixed number of columns

            // Draw table borders
            for (let row = 0; row < numRows; row++) {
                for (let col = 0; col < numCols; col++) {
                    const x = tableX + col * cellWidth;
                    const y = tableY - row * cellHeight;
                    page.drawRectangle({
                        x,
                        y,
                        width: cellWidth,
                        height: cellHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                }
            }



            // Add header text to the table cells    
            page.drawText('Sr No', { x: tableX + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Senators', { x: tableX + cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Sessions', { x: tableX + 2 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Sittings', { x: tableX + 3 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Presence', { x: tableX + 4 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Leave', { x: tableX + 5 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });
            page.drawText('Absence', { x: tableX + 6 * cellWidth + 5, y: tableY + 5, font: fontBold, ...textOptions1 });

            // Add data to the table cells
            for (let row = 0; row < reocrdsAttend.length; row++) {
                const attend = reocrdsAttend[row];

                page.drawText(`${row + 1}`, { x: tableX + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(attend.memberName, { x: tableX + cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(`${attend.sessions}`, { x: tableX + 2 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(`${attend.sittings}`, { x: tableX + 3 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(`${attend.attendanceCounts.Present}`, { x: tableX + 4 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(`${attend.attendanceCounts.Leave}`, { x: tableX + 5 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });
                page.drawText(`${attend.attendanceCounts.Absent}`, { x: tableX + 6 * cellWidth + 5, y: tableY - (row + 1) * cellHeight + 5, ...textOptions });

            }


            // Save the PDF to a file with a dynamic name
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);
            //await fs.writeFile(outputFileName, pdfBytes);


            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },


    // Get Session Sitting Attendance By Single Party
    getSessionSittingAttendanceBySingleParty: async (sessionId,manageSessionId, partyName) => {
        try {
            let politicalParties
            // Find the specified political party by name
            const politicalParty = await PoliticalParties.findOne({
                where: { id: partyName }, // Assuming you want to find by partyName, not id
                attributes: ['id', 'partyName', 'shortName'],
            });
            if (!politicalParty) {
                throw new Error("Political Party Not Found!");
            }
            politicalParties = [politicalParty];

            // Fetch sessions within the specified date range
            const sessions = await Sessions.findAndCountAll({
                where: {id: sessionId}
            });
            // Fetch managed sessions for the found sessions
            const manageSessions = await ManageSessions.findAndCountAll({
                where: { id: manageSessionId }
            });
            const manageSessionIds = manageSessions.rows.map(session => session.id);

            const politicalPartyRecords = await Promise.all(politicalParties.map(async (party) => {
                // Find members belonging to the current political party
                const members = await Members.findAll({
                    where: { politicalParty: party.id },
                    include: [
                        {
                            model: PoliticalParties,
                            as: 'politicalParties',
                            attributes: ['id', 'shortName', 'partyName']
                        }
                    ]
                });

                // Calculate attendance records for each member
                const memberAttendanceRecords = await Promise.all(members.map(async (member) => {
                    const attendanceRecords = await SessionAttendance.findAll({
                        where: {
                            fkManageSessionId: manageSessionIds,
                            fkMemberId: member.id
                        }
                    });
                    // Aggregate attendance statuses
                    const attendanceCounts = { Present: manageSessions.count, Absent: 0, Leave: 0, Suspended: 0, 'Oath Not Taken': 0 };
                    // If there are no manageSessions, set all attendance counts to 0
                    if (manageSessions.count === 0) {
                        for (let status in attendanceCounts) {
                            attendanceCounts[status] = 0;
                        }
                    } else {
                        // Adjust attendance counts based on attendance records
                        attendanceRecords.forEach(record => {
                            if (record.attendanceStatus !== 'Present') {
                                attendanceCounts['Present']--;
                                if (attendanceCounts.hasOwnProperty(record.attendanceStatus)) {
                                    attendanceCounts[record.attendanceStatus]++;
                                }
                            }
                        });
                    }
                    return {
                        memberId: member.id,
                        memberName: member.memberName,
                        sessions: sessions.count,
                        sittings: manageSessions.count,
                        attendanceCounts
                    };
                }));

                return {
                    id: party.id,
                    partyName: party.partyName,
                    shortName: party.shortName,
                    memberAttendanceRecords
                };
            }));

            // Directly return the array of political party records
            return politicalPartyRecords;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Party Wise Data");
        }

    },

     // Get Session Sitting Attendance By Single Province
     getSessionSittingAttendanceBySingleProvince: async (manageSessionId, province) => {
        try {
            const attendanceDataByProvince = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
            // Fetch members from the current province
            const membersInProvince = await Members.findAll({
                where: { memberProvince: province },
                attributes: ['id', 'memberName', 'memberProvince'],
            });

            // Initialize the array for the current province's attendance data
            attendanceDataByProvince[province] = [];

            // Fetch attendance for each member in the province
            for (const member of membersInProvince) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });

                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                // Add the member's attendance data to the province's array
                attendanceDataByProvince[province].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });

                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
            // Combine province-wise data and overall stats
            const response = {
                ...attendanceDataByProvince,
                overallStats,
            };


            return response;
        } catch (error) {
            throw { message: error.message || "Error Retrieving Attendance By Province!" };
        }

    },


    // Get Session Sitting Attendance By Member Name
    getSessionSittingAttendanceByMemberName: async (manageSessionId, memberName) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Fetch members with the given name
            const member = await Members.findOne({
                where: { id: memberName },
                attributes: ['id', 'memberName'],
            });
    
            if (!member) {
                throw new Error(`Member "${memberName}" not found.`);
            }
    
            // Fetch attendance record for the member
            const attendanceRecord = await SessionAttendance.findOne({
                where: {
                    fkManageSessionId: manageSessionId,
                    fkMemberId: member.id,
                },
                attributes: ['attendanceStatus'],
            });
    
            const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
            // Add the member's attendance data
            attendanceData[member.memberName] = {
                memberId: member.id,
                attendanceStatus: attendanceStatus,
            };
    
            // Update overall stats
            if (overallStats.hasOwnProperty(attendanceStatus)) {
                overallStats[attendanceStatus]++;
            } else {
                overallStats[attendanceStatus] = 1;
            }
            overallStats.Total++;
    
            // Combine member-wise data and overall stats
            const response = {
                ...attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw { message: error.message || "Error Retrieving Attendance By Member Name!" };
        }
    },

    // Get Session Sitting Attendance By Province and Party Name
    getSessionSittingAttendanceByProvinceParty: async(manageSessionId,partyName,province) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Fetch members based on partyName and province
            let members;
            if (partyName && province) {
                console.log("Hello")
                // Fetch members belonging to the specified political party and province
                const politicalParty = await PoliticalParties.findOne({
                    where: { id: partyName },
                    attributes: ['id', 'partyName', 'shortName'],
                });
                if (!politicalParty) {
                    throw new Error("Political Party Not Found!");
                }
                members = await Members.findAll({
                    where: { politicalParty: partyName, memberProvince: province },
                    attributes: ['id', 'memberName', 'memberProvince'],
                });
                
            } else {
                throw new Error("Please provide either partyName or province.");
            }
    
            // Fetch attendance for each member
            for (const member of members) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });
    
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
                // Add the member's attendance data
                attendanceData[member.memberName] = {
                    memberId: member.id,
                    attendanceStatus: attendanceStatus,
                };
    
                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
    
            // Combine member-wise data and overall stats
            const response = {
                attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },
   
    // Get Session Sitting Attendance By Party Name and Member Name
    getSessionSittingAttendanceByPartyMember: async (manageSessionId, partyName, memberName) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Ensure either partyName or memberName is provided
            if (!partyName && !memberName) {
                throw new Error("Please provide either partyName or memberName.");
            }
    
            // Fetch members based on partyName and memberName
            let members;
            if (partyName && memberName) {
                // Fetch members belonging to the specified political party and memberName
                const politicalParty = await PoliticalParties.findOne({
                    where: { id: partyName },
                    attributes: ['id', 'partyName', 'shortName'],
                });
                if (!politicalParty) {
                    throw new Error("Political Party Not Found!");
                }
                members = await Members.findAll({
                    where: { politicalParty: partyName, id: memberName },
                    attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
                });
            } 
    
            // Fetch the party name for each member
            const partyNamesMap = {};
            for (const member of members) {
                if (!partyNamesMap[member.politicalParty]) {
                    const party = await PoliticalParties.findOne({
                        where: { id: member.politicalParty },
                        attributes: ['id','partyName','shortName'],
                    });
                    if (party) {
                        partyNamesMap[member.politicalParty] = party.shortName;
                    }
                }
            }
    
            // Fetch attendance for each member
            for (const member of members) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });
    
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
                // Add the member's attendance data with the party name
                const partyName = partyNamesMap[member.politicalParty];
              
                if (!attendanceData[partyName]) {
                    attendanceData[partyName] = [];
                }
                attendanceData[partyName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });
    
                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
    
            // Combine member-wise data and overall stats
            const response = {
                ...attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },      
    
    // Get Session Sitting Attendance By Province and Member Name
    getSessionSittingAttendanceByProvinceMember: async(manageSessionId, province, memberName ) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Ensure either partyName or memberName is provided
            if (!province && !memberName) {
                throw new Error("Please provide either province or memberName.");
            }
    
            // Fetch members based on partyName and memberName
            let members;
            if (province && memberName) {
                members = await Members.findAll({
                    where: { memberProvince: province, id: memberName },
                    attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
                });
            } 
    
            // Fetch attendance for each member
            for (const member of members) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });
    
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
                // Add the member's attendance data with the party name
                const provinceName = member.memberProvince
                if (!attendanceData[provinceName]) {
                    attendanceData[provinceName] = [];
                }
                attendanceData[provinceName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });
    
                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
    
            // Combine member-wise data and overall stats
            const response = {
                ...attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    // Get Session Sitting Attendance By Party, Province and Member Name
    getSessionSittingAttendanceByPartyProvinceMember: async (manageSessionId, partyName, province, memberName) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Ensure either partyName, province, or memberName is provided
            if (!partyName && !province && !memberName) {
                throw new Error("Please provide either partyName, province, or memberName.");
            }
    
            // Fetch members based on partyName, province, and memberName
            let members;
            if (partyName && province && memberName) {
                const politicalParty = await PoliticalParties.findOne({
                    where: { id: partyName },
                    attributes: ['id', 'partyName', 'shortName'],
                });
                if (!politicalParty) {
                    throw new Error("Political Party Not Found!");
                }
                members = await Members.findAll({
                    where: { politicalParty: partyName, memberProvince: province, id: memberName },
                    attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
                });
            } 

             // Fetch the party name for each member
             const partyNamesMap = {};
             for (const member of members) {
                 if (!partyNamesMap[member.politicalParty]) {
                     const party = await PoliticalParties.findOne({
                         where: { id: member.politicalParty },
                         attributes: ['id','partyName','shortName'],
                     });
                     if (party) {
                         partyNamesMap[member.politicalParty] = party.shortName;
                     }
                 }
             }
    
            // Fetch attendance for each member
            for (const member of members) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });
    
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
                // Add the member's attendance data with the province, party, and memberName
                const provinceName = member.memberProvince;
                const partyName = partyNamesMap[member.politicalParty];
                if (!attendanceData[provinceName]) {
                    attendanceData[provinceName] = {};
                }
                if (!attendanceData[provinceName][partyName]) {
                    attendanceData[provinceName][partyName] = [];
                }
                attendanceData[provinceName][partyName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });
    
                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
    
            // Combine member-wise data and overall stats
            const response = {
                ...attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },    

    // Get Session Sitting Attendance By Single Sitting Id
    getSessionSittingAttendanceBySessionSitting: async (manageSessionId) => {
        try {
            const attendanceData = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };
    
            // Fetch members based on partyName, province, and memberName
            let members;
   
               await PoliticalParties.findAll({
                    attributes: ['id', 'partyName', 'shortName'],
                });

                members = await Members.findAll({
                    attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
                });
    

             // Fetch the party name for each member
             const partyNamesMap = {};
             for (const member of members) {
                 if (!partyNamesMap[member.politicalParty]) {
                     const party = await PoliticalParties.findOne({
                         where: { id: member.politicalParty },
                         attributes: ['id','partyName','shortName'],
                     });
                     if (party) {
                         partyNamesMap[member.politicalParty] = party.shortName;
                     }
                 }
             }
    
            // Fetch attendance for each member
            for (const member of members) {
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSessionId,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });
    
                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
    
                // Add the member's attendance data with the province, party, and memberName
                const provinceName = member.memberProvince;
                const partyName = partyNamesMap[member.politicalParty];
                if (!attendanceData[provinceName]) {
                    attendanceData[provinceName] = {};
                }
                if (!attendanceData[provinceName][partyName]) {
                    attendanceData[provinceName][partyName] = [];
                }
                attendanceData[provinceName][partyName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });
    
                // Update overall stats
                if (overallStats.hasOwnProperty(attendanceStatus)) {
                    overallStats[attendanceStatus]++;
                } else {
                    overallStats[attendanceStatus] = 1;
                }
                overallStats.Total++;
            }
    
            // Combine member-wise data and overall stats
            const response = {
                ...attendanceData,
                overallStats,
            };
    
            return response;
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },



    // Get Session Sitting Attendance By Single Province
    generatedPDF: async (attendanceDataByProvince, fetchedSession) => {
        try {

            // Create a new PDF document
            const pdfDoc = await PDFDocument.create();

            // Embed a standard font
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman)
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);


            // Add a new page to the document
            const page = pdfDoc.addPage();

            // Define basic coordinates and styling
            const fontSize = 10;


            // Add image to the page
            let yCoordinate = page.getHeight() - 50;

            // Add text to the page with a vertical gap
            const textOptions1 = { fontBold, color: rgb(0, 0, 0), size: fontSize, bold: true }
            const textOptions = { font, color: rgb(0, 0, 0), size: fontSize };

            // console.log("attendanceDataByProvince*****", fetchedSession.session.sessionName)

            const verticalGap = 10; // Adjust the gap as needed
            page.drawText('SENATE OF PAKISTAN', { x: 210 + 10, y: yCoordinate + verticalGap + 20, font: fontBold, ...textOptions1 });
            page.drawText('Notice-Office', { x: 240 + 10, y: yCoordinate + verticalGap, font: fontBold, ...textOptions1 });

            // sessionName
            page.drawText('SESSION:', { x: 400 + 10, y: yCoordinate + verticalGap - 30, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.session.sessionName}`, { x: 430 + 50, y: yCoordinate + verticalGap - 30, ...textOptions, })
            // sittingStartTime
            page.drawText('Commenced at:', { x: 400 + 10, y: yCoordinate + verticalGap - 50, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.sittingStartTime}`, { x: 430 + 50, y: yCoordinate + verticalGap - 50, ...textOptions, })
            // sessionAdjourned
            page.drawText('Adjourned:', { x: 400 + 10, y: yCoordinate + verticalGap - 70, font: fontBold, ...textOptions1 });
            page.drawText(`${fetchedSession.sessionAdjourned}`, { x: 430 + 50, y: yCoordinate + verticalGap - 70, ...textOptions, })

            // const sittingDate = new Date(fetchedSession.sittingDate);
            // const formattedDate = sittingDate.toLocaleDateString('en-GB').replace(/\//g, '-'); // 'en-GB' for the desired format

            //console.log(formattedDate);
            // Subject Text
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${fetchedSession.sittingDate}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });






            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;



            for (const provinceName in attendanceDataByProvince) {

                if (attendanceDataByProvince.hasOwnProperty(provinceName)) {
                    const provinceData = attendanceDataByProvince[provinceName];



                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData.length + 1;
                    const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

                    if (!isFirstProvince) {
                        const shouldAddPage = provinceName !== 'overallStats';



                        if (shouldAddPage) {
                            pdfDoc.addPage(); // Add a new page for provinces other than the first one
                        } else {
                            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap




                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    const provinceTableX = 60;
                    const provinceTableY = currentYCoordinate - 150;




                    // if (provinceName == 'overallStats') {
                    //     const provinceTableY = currentYCoordinate - 550;

                    //     for (let row = 0; row < provinceNumRows; row++) {
                    //         for (let col = 0; col < 2; col++) {
                    //             const x = provinceTableX + col * 130;
                    //             const y = provinceTableY - row * 20;
                    //             currentPage.drawRectangle({
                    //                 x,
                    //                 y,
                    //                 width: 130,
                    //                 height: 20,
                    //                 borderColor: rgb(0, 0, 0),
                    //                 borderWidth: 1,
                    //             });
                    //         }
                    //     }



                    //     // Add data to the province table cells
                    //     let row = 0; // Initialize row counter
                    //     for (const property in provinceData) {
                    //         if (provinceData.hasOwnProperty(property) && property !== 'Suspended') {
                    //             const columnX = provinceTableX + 280; // Initial X-coordinate for the first column
                    //             const y = provinceTableY - (row + 1) * 20 + 5; // Y-coordinate

                    //             currentPage.drawText(property, { x: columnX, y, ...textOptions }); // Draw property name
                    //             currentPage.drawText(String(provinceData[property]), { x: columnX + 100, y, ...textOptions }); // Draw property value as a string

                    //             row++; // Increment row counter
                    //         }
                    //     }

                    // }
                    // else {

                    // Draw table borders
                    for (let row = 0; row < provinceNumRows; row++) {
                        for (let col = 0; col < 3; col++) {
                            const x = provinceTableX + col * 160;
                            const y = provinceTableY - row * 20;
                            currentPage.drawRectangle({
                                x,
                                y,
                                width: 160,
                                height: 20,
                                borderColor: rgb(0, 0, 0),
                                borderWidth: 1,
                            });
                        }
                    }

                    //  currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });

                    // Add header text to the province table cells
                    currentPage.drawText('Sr No', { x: provinceTableX + 5, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                    currentPage.drawText('Member Name', { x: provinceTableX + 165, y: provinceTableY + 5, font: fontBold, ...textOptions1 });
                    currentPage.drawText('Attendance Status', { x: provinceTableX + 370, y: provinceTableY + 5, font: fontBold, ...textOptions1 });

                    // Add data to the province table cells
                    for (let row = 0; row < provinceData.length; row++) {
                        const attend = provinceData[row];
                        currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                        globalRowCounter++;
                    }
                }
            }


            // page.drawText('BREAK UP', { x: 400 + 10, y: yCoordinate + verticalGap - 300, font: fontBold, ...textOptions1 });

            // Save the PDF to a file with a dynamic name
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);
            //await fs.writeFile(outputFileName, pdfBytes);


            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },


    // Generate PDF For Session Sitting Days
    wrapText: (text, font, fontSize, maxWidth) => {
        const lines = [];
        const words = text.split(' ');
        let currentLine = words[0];

        for (let i = 1; i < words.length; i++) {
            const word = words[i];
            const width = font.widthOfTextAtSize(`${currentLine} ${word}`, fontSize);
            if (width < maxWidth) {
                currentLine += ` ${word}`;
            } else {
                lines.push(currentLine);
                currentLine = word;
            }
        }
        lines.push(currentLine); // Add the last line

        return lines;
    },

    //Generate PDF For Session Sitting Days
    generateSessionSittingsPDF: async (sessionSittings, year) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            // Create a page in landscape orientation
            const page = pdfDoc.addPage([792, 612]); // Landscape orientation dimensions

            const fontSize = 8;
            const textOptions = { font, size: fontSize, color: rgb(0, 0, 0) };
            const textOptionsBold = { font: fontBold, size: fontSize, color: rgb(0, 0, 0) };

            // Titles setup
            const title = 'SENATE OF PAKISTAN';
            const noticeOffice = 'Notice-Office';
            const durationTitle = `Duration Of Presiding Time During Parliamentary Year ${year}-${parseInt(year) + 1}`;
            const titles = [title, noticeOffice, durationTitle];

            let yCoordinate = page.getHeight() - 50;
            titles.forEach((text, index) => {
                const textWidth = fontBold.widthOfTextAtSize(text, fontSize);
                const textX = (page.getWidth() - textWidth) / 2;
                page.drawText(text, { x: textX, y: yCoordinate - index * 20, ...textOptionsBold });
            });

            // Table settings
            const tableStartY = yCoordinate - 70;
            const cellHeight = 20;
            const cellWidth = page.getWidth() / 10;

            // Draw table headers with borders
            const headers = ['Sr No', 'Session', 'Date', 'Start Time', 'Adjourned Time', 'Duration', 'Duration In Words', 'Chairman', 'Presided By', 'Presiding Officer'];
            headers.forEach((header, index) => {
                const headerX = index * cellWidth;
                page.drawText(header, { x: headerX + 5, y: tableStartY - 12, ...textOptionsBold });
                page.drawRectangle({
                    x: headerX,
                    y: tableStartY - cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
            });

            // Draw table rows with data and borders
            // sessionSittings.forEach((session, rowIndex) => {
            //     headers.forEach((_, colIndex) => {
            //         let text = ''; // Determine text based on colIndex and session data
            //         // Your existing switch-case logic for setting `text`
            //         switch (colIndex) {
            //             case 0: text = `${rowIndex + 1}`; break;
            //             case 1: text = `${session.session.sessionName}` || ''; break;
            //             case 2: text = `${session.sittingDate}` || ''; break;
            //             case 3: text = `${session.sittingStartTime}` || ''; break;
            //             case 4: text = `${session.sessionAdjourned}` || ''; break;
            //             case 5: text = `${session.sessionDuration}` || ''; break;
            //             case 6: text = `${session.totalTimeInWords}` || ''; break;
            //             case 7: text = `${session.totalTimeInWords}` || ''; break;
            //             case 8: text = `${session.totalTimeInWords}` || ''; break;
            //             case 9: text = `${session.totalTimeInWords}` || ''; break;

            //         const cellX = colIndex * cellWidth;
            //         const rowY = tableStartY - (rowIndex + 1) * cellHeight - cellHeight;
            //         const lines = manageSessionsService.wrapText(text, font, fontSize, cellWidth - 4);

            //         lines.forEach((line, lineIndex) => {
            //             const lineY = rowY + cellHeight - (lineIndex + 1) * fontSize;
            //             page.drawText(line, { x: cellX + 5, y: lineY, ...textOptions });
            //         });

            //         // Draw cell border
            //         page.drawRectangle({
            //             x: cellX,
            //             y: rowY,
            //             width: cellWidth,
            //             height: cellHeight * lines.length, // Adjust height based on the number of lines
            //             borderColor: rgb(0, 0, 0),
            //             borderWidth: 1,
            //         });
            //     });
            // });
            // Draw table rows with data and borders
            sessionSittings.forEach((session, rowIndex) => {
                headers.forEach((_, colIndex) => {
                    let text = ''; // Initialize text for each cell

                    // Corrected switch statement
                    switch (colIndex) {
                        case 0: text = `${rowIndex + 1}`; break;
                        case 1: text = `${session.session.sessionName}` || ''; break;
                        case 2: text = `${session.sittingDate}` || ''; break;
                        case 3: text = `${session.sittingStartTime}` || ''; break;
                        case 4: text = `${session.sessionAdjourned}` || ''; break;
                        case 5: text = `${session.sessionDuration}` || ''; break;
                        case 6: text = `${session.totalTimeInWords}` || ''; break;
                        case 7: // Further cases if you have different data
                            text = `${session.totalTimeInWords}` || ''; // Assuming this is placeholder text for now
                            break;
                        case 8:
                            text = `${session.totalTimeInWords}` || ''; // Placeholder
                            break;
                        case 9:
                            text = `${session.totalTimeInWords}` || ''; // Placeholder
                            break;
                        default:
                            text = '';
                    }

                    const cellX = colIndex * cellWidth;
                    const rowY = tableStartY - (rowIndex + 1) * cellHeight - cellHeight;
                    const lines = manageSessionsService.wrapText(text, font, fontSize, cellWidth - 4);

                    lines.forEach((line, lineIndex) => {
                        const lineY = rowY + cellHeight - (lineIndex + 1) * fontSize;
                        page.drawText(line, { x: cellX + 5, y: lineY, ...textOptions });
                    });

                    // Draw cell border
                    page.drawRectangle({
                        x: cellX,
                        y: rowY,
                        width: cellWidth,
                        height: cellHeight * lines.length, // Adjust height based on the number of lines
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                });
            });

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
            throw new Error('Failed to generate session sittings PDF.');
        }
    },

    // For Upto 3 Years
    generateSessionSittingsFor3YearsPDF: async (sessionSittings, year) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            // Create a page in landscape orientation
            const page = pdfDoc.addPage([792, 612]); // Landscape orientation dimensions

            const fontSize = 8;
            const textOptions = { font, size: fontSize, color: rgb(0, 0, 0) };
            const textOptionsBold = { font: fontBold, size: fontSize, color: rgb(0, 0, 0) };

            // Titles setup
            const title = 'SENATE OF PAKISTAN';
            const noticeOffice = 'Notice-Office';
            const durationTitle = `Duration Of Presiding Time During Parliamentary Year ${year}-${parseInt(year) + 2}`;
            const titles = [title, noticeOffice, durationTitle];

            let yCoordinate = page.getHeight() - 50;
            titles.forEach((text, index) => {
                const textWidth = fontBold.widthOfTextAtSize(text, fontSize);
                const textX = (page.getWidth() - textWidth) / 2;
                page.drawText(text, { x: textX, y: yCoordinate - index * 20, ...textOptionsBold });
            });

            // Table settings
            const tableStartY = yCoordinate - 70;
            const cellHeight = 20;
            const cellWidth = page.getWidth() / 10;

            // Draw table headers with borders
            const headers = ['Sr No', 'Session', 'Date', 'Start Time', 'Adjourned Time', 'Duration', 'Duration In Words', 'Chairman', 'Presided By', 'Presiding Officer'];
            headers.forEach((header, index) => {
                const headerX = index * cellWidth;
                page.drawText(header, { x: headerX + 5, y: tableStartY - 12, ...textOptionsBold });
                page.drawRectangle({
                    x: headerX,
                    y: tableStartY - cellHeight,
                    width: cellWidth,
                    height: cellHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });
            });

            // Draw table rows with data and borders
            // sessionSittings.forEach((session, rowIndex) => {
            //     headers.forEach((_, colIndex) => {
            //         let text = ''; // Determine text based on colIndex and session data
            //         // Your existing switch-case logic for setting `text`
            //         switch (colIndex) {
            //             case 0: text = `${rowIndex + 1}`; break;
            //             case 1: text = `${session.session.sessionName}` || ''; break;
            //             case 2: text = `${session.sittingDate}` || ''; break;
            //             case 3: text = `${session.sittingStartTime}` || ''; break;
            //             case 4: text = `${session.sessionAdjourned}` || ''; break;
            //             case 5: text = `${session.sessionDuration}` || ''; break;
            //             case 6: text = `${session.totalTimeInWords}` || ''; break;
            //             case 7: text = `${session.totalTimeInWords}` || ''; break;
            //             case 8: text = `${session.totalTimeInWords}` || ''; break;
            //             case 9: text = `${session.totalTimeInWords}` || ''; break;

            //         const cellX = colIndex * cellWidth;
            //         const rowY = tableStartY - (rowIndex + 1) * cellHeight - cellHeight;
            //         const lines = manageSessionsService.wrapText(text, font, fontSize, cellWidth - 4);

            //         lines.forEach((line, lineIndex) => {
            //             const lineY = rowY + cellHeight - (lineIndex + 1) * fontSize;
            //             page.drawText(line, { x: cellX + 5, y: lineY, ...textOptions });
            //         });

            //         // Draw cell border
            //         page.drawRectangle({
            //             x: cellX,
            //             y: rowY,
            //             width: cellWidth,
            //             height: cellHeight * lines.length, // Adjust height based on the number of lines
            //             borderColor: rgb(0, 0, 0),
            //             borderWidth: 1,
            //         });
            //     });
            // });
            // Draw table rows with data and borders
            sessionSittings.forEach((session, rowIndex) => {
                headers.forEach((_, colIndex) => {
                    let text = ''; // Initialize text for each cell

                    // Corrected switch statement
                    switch (colIndex) {
                        case 0: text = `${rowIndex + 1}`; break;
                        case 1: text = `${session.session.sessionName}` || ''; break;
                        case 2: text = `${session.sittingDate}` || ''; break;
                        case 3: text = `${session.sittingStartTime}` || ''; break;
                        case 4: text = `${session.sessionAdjourned}` || ''; break;
                        case 5: text = `${session.sessionDuration}` || ''; break;
                        case 6: text = `${session.totalTimeInWords}` || ''; break;
                        case 7: // Further cases if you have different data
                            text = `${session.totalTimeInWords}` || ''; // Assuming this is placeholder text for now
                            break;
                        case 8:
                            text = `${session.totalTimeInWords}` || ''; // Placeholder
                            break;
                        case 9:
                            text = `${session.totalTimeInWords}` || ''; // Placeholder
                            break;
                        default:
                            text = '';
                    }

                    const cellX = colIndex * cellWidth;
                    const rowY = tableStartY - (rowIndex + 1) * cellHeight - cellHeight;
                    const lines = manageSessionsService.wrapText(text, font, fontSize, cellWidth - 4);

                    lines.forEach((line, lineIndex) => {
                        const lineY = rowY + cellHeight - (lineIndex + 1) * fontSize;
                        page.drawText(line, { x: cellX + 5, y: lineY, ...textOptions });
                    });

                    // Draw cell border
                    page.drawRectangle({
                        x: cellX,
                        y: rowY,
                        width: cellWidth,
                        height: cellHeight * lines.length, // Adjust height based on the number of lines
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1,
                    });
                });
            });

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
            throw new Error('Failed to generate session sittings PDF.');
        }
    },

}

module.exports = manageSessionsService