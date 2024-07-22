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
                committeeStartTime: req.committeeStartTime ? req.committeeStartTime : null,
                committeeEndTime: req.committeeEndTime ? req.committeeEndTime : null,
                sessionProrogued: req.sessionProrogued,
                privateMemberDay: req.privateMemberDay
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


            if (req.sessionProrogued === true) {
                const proroguedDate = new Date()
                await Sessions.update({
                    isProrogued: true,
                    proroguedDate: proroguedDate
                }, {
                    where: {
                        id: req.fkSessionId
                    }
                })
            }
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
                const sittingStartTime = moment(session.sittingStartTime, "h:mm A");
                const sessionEndTime = moment(session.sittingEndTime, "h:mm A");
                const sessionDuration = moment.duration(sessionEndTime.diff(sittingStartTime));
                const sessionMinutes = sessionDuration.asMinutes();
                const sessionTotalTime = `${Math.floor(sessionMinutes / 60)}h:${sessionMinutes % 60}m`;
                const sessionTotalDuration = await manageSessionsService.minutesToWords(sessionMinutes)
                // const committeeStartTime = moment(session.committeeStartTime, "h:mm A") 
                // console.log(committeeStartTime)
                // console.log("HHH",session.committeeStartTime)
                let committeeStartTime = session.committeeStartTime ? moment(session.committeeStartTime, "h:mm A") : null;
                if (committeeStartTime && !committeeStartTime.isValid()) {
                    // If the date is not valid, set it to null
                    committeeStartTime = null;
                }
                //console.log("Committe Start",committeeStartTime) 
                //  const committeeEndTime = moment(session.committeeEndTime, "h:mm A")

                let committeeEndTime = session.committeeEndTime ? moment(session.committeeEndTime, "h:mm A") : null;
                if (committeeEndTime && !committeeEndTime.isValid()) {
                    // If the date is not valid, set it to null
                    committeeEndTime = null;
                }
                // let committeeDuration;
                // let committeeMinutes
                let committeeTotalTime;
                if (committeeStartTime !== null && committeeEndTime !== null) {
                    let committeeDuration = moment.duration(committeeEndTime.diff(committeeStartTime))
                    let committeeMinutes = committeeDuration.asMinutes();
                    committeeTotalTime = `${Math.floor(committeeMinutes / 60)}h: ${committeeMinutes % 60}m`

                }

                let sessionMemberDetails = [];
                let totalMemberMinutes = 0; // Initialize total break minutes counter

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
                            // Add the break duration to the total break minutes counter
                            totalMemberMinutes += memberMinutes;
                            const memberTotalTime = `${Math.floor(memberMinutes / 60)}h:${memberMinutes % 60}m`;
                            const durationInWords = await manageSessionsService.minutesToWords(memberMinutes);
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
                let totalBreakMinutes = 0; // Initialize total break minutes counter
                if (session.fkSessionBreakId && session.fkSessionBreakId.length > 0) {
                    sessionBreakDetails = await Promise.all(session.fkSessionBreakId.map(async (breakId) => {
                        const breakData = await SessionBreakDetails.findByPk(breakId);
                        const breakStartTime = moment(breakData.breakStartTime, "h:mm A");
                        const breakEndTime = moment(breakData.breakEndTime, "h:mm A");
                        const breakDuration = moment.duration(breakEndTime.diff(breakStartTime));
                        const breakMinutes = breakDuration.asMinutes();
                        // Add the break duration to the total break minutes counter
                        totalBreakMinutes += breakMinutes;
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


                // Total Member Minutes
                const totalMemberHours = Math.floor(totalMemberMinutes / 60);
                const totalMemberMinutesRemainder = totalMemberMinutes % 60;
                const totalMemberTime = `${totalMemberHours}h:${totalMemberMinutesRemainder}m`;

                // Total Break Minutes
                const totalBreakHours = Math.floor(totalBreakMinutes / 60);
                const totalBreakMinutesRemainder = totalBreakMinutes % 60;
                const totalBreakTime = `${totalBreakHours}h:${totalBreakMinutesRemainder}m`;

                return {
                    ...session.toJSON(),
                    committeeTotalTime: committeeTotalTime,
                    sessionDuration: sessionTotalTime,
                    totalTimeInWords: sessionTotalDuration,
                    totalMemberTime: totalMemberTime,
                    totalBreakTime: totalBreakTime,
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

    // Get Prorogued Sessions
    getProroguedSessions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;

            // Fetch sessions with pagination
            const { count, rows } = await Sessions.findAndCountAll({
                //where: { isProrogued: true },
                include: [{
                    model: ManageSessions,
                    //   where: {sessionProrogued: true},
                    attributes: ['id', 'sessionProrogued'],
                    include: [{
                        model: SessionMemberDetails,
                        attributes: ['fkMemberId', 'startTime', 'endTime'],
                        include: [{
                            model: Members,
                            attributes: ['memberName']
                        }]
                    }, {
                        model: SessionBreakDetails,
                        attributes: ['breakStartTime', 'breakEndTime']
                    }]
                }],
                attributes: ['id', 'sessionName', 'startDate', 'endDate', 'proroguedDate'],
                offset,
                limit,
                distinct: true,
                order: [['id', 'DESC']]
            });

            // if (!rows || rows.length === 0) {
            //     throw new Error("Sessions not found!");
            // }



            const sessionSittings = rows.map(session => {
                let totalProroguedSittings = 0;
                let totalNonProroguedSittings = 0;

                // Calculate prorogued and non-prorogued counts
                const manageSessionsDetails = session.manageSessions.map(manageSession => {
                    manageSession.sessionProrogued ? totalProroguedSittings++ : totalNonProroguedSittings++;

                    // Map session member details
                    const sessionMemberDetails = manageSession.sessionMemberDetails.map(detail => ({
                        fkMemberId: detail.fkMemberId,
                        startTime: detail.startTime,
                        endTime: detail.endTime,
                    }));

                    // Map session break details
                    const sessionBreakDetails = manageSession.sessionBreakDetails.map(breakDetail => ({
                        breakStartTime: breakDetail.breakStartTime,
                        breakEndTime: breakDetail.breakEndTime
                    }));

                    return {
                        manageSessionId: manageSession.id,
                        sessionProrogued: manageSession.sessionProrogued,
                        sessionMembers: sessionMemberDetails,
                        sessionBreaks: sessionBreakDetails
                    };
                });

                return {
                    sessionId: session.id,
                    sessionName: session.sessionName,
                    sessionStartDate: session.startDate,
                    sessionEndDate: session.endDate,
                    sessionProroguedDate: session.proroguedDate,
                    sessionProrogued: session.isProrogued,
                    isSessionProrogued: totalProroguedSittings > 0,
                    totalProroguedSittings,
                    totalNonProroguedSittings,
                    manageSessionsDetails
                };
            });
            const totalPages = Math.ceil(count / pageSize);
            return {
                count,
                totalPages,
                sessionSittings
            };
        } catch (error) {
            console.error("Error in getProroguedSessions:", error.message);
            return {
                success: false,
                message: error.message || "Error fetching session sittings"
            };
        }
    },

    // Get Chairman, Deputy Chairman and Presiding Officer
    getTop3Members: async () => {
        try {
            const topMembers = await Members.findAll({
                where: {
                    [Op.or]: [
                        { memberName: { [Op.like]: '% - Chairman' } },
                        { memberName: { [Op.like]: '% - Deputy Chairman' } },
                        { memberName: { [Op.like]: '%Presiding Officer' } }
                    ]
                },
            });
            return topMembers;
        } catch (error) {
            throw new Error(error.message || "Error Fetching Top 3 Members");
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

    //Mark/Update Session Sitting Attendance To Leave
    markSessionSittingAttendanceToLeave: async (sessionId, sittingId, memberId, attendanceStatus) => {
        try {
            // Fetch all existing sessions for the given sittingId
            const manageSession = await ManageSessions.findAll({
                where: { id: sittingId },
            });

            if (!manageSession.length) {
                throw new Error("No sessions found for the given sittingId.");
            }

            // Extract sittingIds from manageSession
            const sittingIds = manageSession.map(session => session.id);

            // Fetch all existing attendance records for the session and the specific member
            const existingAttendance = await SessionAttendance.findOne({
                where: {
                    fkManageSessionId: sittingIds,
                    fkMemberId: memberId
                }
            });

            // If an attendance record exists for the member, update it
            if (existingAttendance) {
                await SessionAttendance.update(
                    { attendanceStatus: attendanceStatus },
                    { where: { id: existingAttendance.id } }
                );
            } else {
                // Otherwise, create a new attendance record
                await SessionAttendance.create({
                    fkManageSessionId: sittingId, // Assuming you meant to use the original sittingId here
                    fkMemberId: memberId,
                    attendanceStatus: attendanceStatus
                });
            }

            // Optionally, return the updated or new attendance record
            const updatedOrNewAttendance = await SessionAttendance.findOne({
                where: {
                    fkManageSessionId: sittingIds,
                    fkMemberId: memberId
                }
            });

            return updatedOrNewAttendance;

        } catch (error) {
            throw { message: error.message || "Error Marking Attendance!" };
        }
    },

    //Mark/Update All Sessions Sittings on the Session Id Attendance To Leave
    markSessionAttendanceToLeave: async (sessionId, memberId, attendanceStatus) => {
        try {

            const manageSessions = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
            });

            if (!manageSessions.length) {
                throw new Error("No sessions found for the given sessionId.");
            }

            // Process each manageSession to update or create SessionAttendance
            for (const manageSession of manageSessions) {
                // Check for an existing attendance record for the session and member
                let existingAttendance = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSession.id,
                        fkMemberId: memberId
                    }
                });

                // If an attendance record exists, update it
                if (existingAttendance) {
                    await SessionAttendance.update(
                        { attendanceStatus: attendanceStatus },
                        { where: { id: existingAttendance.id } }
                    );
                } else {
                    // Otherwise, create a new attendance record for each manageSession
                    await SessionAttendance.create({
                        fkManageSessionId: manageSession.id,
                        fkMemberId: memberId,
                        attendanceStatus: attendanceStatus
                    });
                }
            }

            // Optionally, return the updated or new attendance records for all manageSessions
            const updatedOrNewAttendances = await SessionAttendance.findAll({
                where: {
                    fkManageSessionId: manageSessions.map(session => session.id),
                    fkMemberId: memberId
                }
            });

            return updatedOrNewAttendances;

        } catch (error) {
            throw { message: error.message || "Error Marking Attendance!" };
        }
    },

    //Mark/Update All Sessions Sittings on the Session Start Day Attendance To Leave
    markSessionsDaysAttendanceToLeave: async (startDay, endDay, memberId, attendanceStatus) => {
        try {

            const startDate = moment(startDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
            const endDate = moment(endDay, 'DD-MM-YYYY').format('YYYY-MM-DD');
            const sessions = await Sessions.findAll({
                where: {
                    startDate: {
                        [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            });
            const sessionIds = sessions.map(session => session.id);
            const manageSessions = await ManageSessions.findAll({
                where: { fkSessionId: sessionIds },
            });

            if (!manageSessions.length) {
                throw new Error("No sessions found for the given sessionId.");
            }

            // Process each manageSession to update or create SessionAttendance
            for (const manageSession of manageSessions) {
                // Check for an existing attendance record for the session and member
                let existingAttendance = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: manageSession.id,
                        fkMemberId: memberId
                    }
                });

                // If an attendance record exists, update it
                if (existingAttendance) {
                    await SessionAttendance.update(
                        { attendanceStatus: attendanceStatus },
                        { where: { id: existingAttendance.id } }
                    );
                } else {
                    // Otherwise, create a new attendance record for each manageSession
                    await SessionAttendance.create({
                        fkManageSessionId: manageSession.id,
                        fkMemberId: memberId,
                        attendanceStatus: attendanceStatus
                    });
                }
            }

            // Optionally, return the updated or new attendance records for all manageSessions
            const updatedOrNewAttendances = await SessionAttendance.findAll({
                where: {
                    fkManageSessionId: manageSessions.map(session => session.id),
                    fkMemberId: memberId
                }
            });

            return updatedOrNewAttendances;

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

            const manageSessions = await ManageSessions.findAndCountAll({
                where: {
                    sittingDate : {
                        [Op.between] : [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            })
            const sessionIds = manageSessions.rows.map(session => session.fkSessionId)

            // politicalParties = [politicalParty];
            // Fetch sessions within the specified date range
            // const sessions = await Sessions.findAndCountAll({
            //     where: {
            //         startDate: {
            //             [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
            //         }
            //     }
            // });
           // const sessionIds = sessions.rows.map(session => session.id);
            const sessions = await Sessions.findAndCountAll({
                where: {
                    id: sessionIds
                }
            });
            // Fetch managed sessions for the found sessions
            // const manageSessions = await ManageSessions.findAndCountAll({
            //     where: { fkSessionId: sessionIds }
            // });
           // const manageSessionIds = manageSessions.rows.map(session => session.id);

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
                            fkManageSessionId: sessionIds,
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

            const manageSessions = await ManageSessions.findAndCountAll({
                where: {
                    sittingDate : {
                        [Op.between] : [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            })
            //console.log("Manage Sessions",manageSessions)

            const sessionIds = manageSessions.rows.map(session => session.fkSessionId)
            // Fetch sessions within the specified date range
            // const sessions = await Sessions.findAndCountAll({
            //     where: {
            //         startDate: {
            //             [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
            //         }
            //     }
            // });
                        const sessions = await Sessions.findAndCountAll({
                where: {
                    id: sessionIds
                }
            });
          //  const sessionIds = sessions.rows.map(session => session.id);
            // Fetch managed sessions for the found sessions
            // const manageSessions = await ManageSessions.findAndCountAll({
            //     where: { fkSessionId: sessionIds }
            // });
            //const manageSessionIds = manageSessions.rows.map(session => session.id);

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
                            fkManageSessionId: sessionIds,
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
            // const sessions = await Sessions.findAndCountAll({
            //     where: {
            //         startDate: {
            //             [Op.between]: [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
            //         }
            //     }
            // });
            // const sessionIds = sessions.rows.map(session => session.id);
            const manageSessions = await ManageSessions.findAndCountAll({
                where: {
                    sittingDate : {
                        [Op.between] : [`${startDate} 00:00:00`, `${endDate} 23:59:59`]
                    }
                }
            })
            const sessionIds = manageSessions.rows.map(session => session.fkSessionId)
            
            const sessions = await Sessions.findAndCountAll({
                where: {
                    id: sessionIds
                }
            });
            // Fetch managed sessions for the found sessions
            // const manageSessions = await ManageSessions.findAndCountAll({
            //     where: { fkSessionId: sessionIds }
            // });
            // const manageSessionIds = manageSessions.rows.map(session => session.id);

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
                            fkManageSessionId: sessionIds,
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
    getUpto3YearsAttendanceRecord: async (startYear) => {
        try {
           // console.log(startYear)
            let politicalParties;
            let allYearsData = [];

            for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
                const year = parseInt(startYear) + yearOffset;
                const startDate = moment(`${year}-01-01`).startOf('year').format('YYYY-MM-DD');
                const endDate = moment(`${year}-12-31`).endOf('year').format('YYYY-MM-DD');

                // if (!partyName) {
                politicalParties = await PoliticalParties.findAll({
                    attributes: ['id', 'partyName', 'shortName'],
                });
                // } else if (yearOffset === 0) { // Fetch once if partyName is specified
                //     const politicalParty = await PoliticalParties.findOne({
                //         where: { id: partyName },
                //         attributes: ['id', 'partyName', 'shortName'],
                //     });
                //     if (!politicalParty) {
                //         throw new Error("Political Party Not Found!");
                //     }
                //     politicalParties = [politicalParty];
                // }

                // const sessions = await Sessions.findAndCountAll({
                //     where: {
                //         startDate: {
                //             [Op.between]: [startDate, `${endDate} 23:59:59`]
                //         }
                //     }
                // });
                // const sessionIds = sessions.rows.map(session => session.id);
                const manageSessions = await ManageSessions.findAndCountAll({
                    where: {
                        sittingDate : {
                            [Op.between] : [startDate, `${endDate} 23:59:59`]
                        }
                    }
                })
                const sessionIds = manageSessions.rows.map(session => session.fkSessionId)
                const sessions = await Sessions.findAndCountAll({
                    where: {
                        id: sessionIds
                    }
                });

                // const manageSessions = await ManageSessions.findAndCountAll({
                //     where: { fkSessionId: sessionIds }
                // });
                // const manageSessionIds = manageSessions.rows.map(session => session.id);

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
                                fkManageSessionId: sessionIds,
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

    // Generate Yearly Attendance PDF
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
                page.drawText(`${year} DURING SENATE SESSIONS`, { x: 195, y: yCoordinate + verticalGap - 50, font: fontBold, size: 10 });

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

    // Generate Upto 3 Years Attendance PDF
    generateUpto3YearsAttendancePDF: async (startYear, attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            const verticalGap = 10;
            const cellWidth = 70;
            const cellHeight = 20;
            const customColWidths = [50, 150, 60, 60, 60, 60, 60];

            // New loop for each year
            for (let yearOffset = 0; yearOffset < 3; yearOffset++) {
                const year = parseInt(startYear) + yearOffset;

                for (const party of attendance.filter(att => att.year === year)) { // Filter attendance data for the current year
                    const page = pdfDoc.addPage();
                    const yCoordinateInitial = page.getHeight() - 50;

                    // Draw the initial four lines
                    page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinateInitial, font: fontBold, size: 10 });
                    page.drawText('Notice-Office', { x: 250, y: yCoordinateInitial - 15, font: fontBold, size: 10 });
                    page.drawText(`ATTENDANCE, LEAVE & ABSENCE RECORD OF SENATORS FOR THE PERIOD`, { x: 80, y: yCoordinateInitial - 30, font: fontBold, size: 10 });
                    page.drawText(`${startYear}-${parseInt(startYear) + 2} DURING SENATE SESSIONS`, { x: 195, y: yCoordinateInitial - 45, font: fontBold, size: 10 });

                    // Adjust yCoordinate after the initial four lines
                    const yCoordinate = yCoordinateInitial - 70; // Adjusted for space under the initial headings

                    // Draw year and party name under the initial four lines
                    page.drawText(`Year: ${year}`, { x: 45, y: yCoordinate, font: fontBold, size: 12 });
                    page.drawText(`Party: ${party.partyName}`, { x: 45, y: yCoordinate - 15, font: font, size: 10 });

                    // const tableY = yCoordinate - 70; // Adjust tableY based on the added headings
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

                    // Draw table borders, headers, and data as before...

                    // Add header text to the table cells...
                    // Add data to the table cells...
                }
            }

            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save();

            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
        }
    },

    // Get Session Sitting Attendance By Single Province
    generatedPDFForSingleProvince: async (attendanceDataByProvince, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });

            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;
            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;


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
                            // const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            //  let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap




                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    // const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    //let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    // const provinceTableX = 60;
                    // const provinceTableY = currentYCoordinate - 150;




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
            const statsPage = pdfDoc.addPage();
            const { width, height } = statsPage.getSize();
            let statsStartY = height - 50; // Start from the top of the new page

            // Draw the "Break Up" title
            statsPage.drawText("BREAK UP", { x: 400, y: statsStartY, font: fontBold, ...textOptions1 });
            statsStartY -= 20; // Add some space before starting the stats table

            // Draw table for "Overall Stats"
            const statsEntries = Object.entries(attendanceDataByProvince.overallStats);
            const keyColumnWidth = 80; // Adjust the width as needed
            const valueColumnWidth = 50; // Adjust the width as needed
            const rowHeight = 20; // Height of each row in the table

            statsEntries.forEach(([key, value], index) => {
                // Adjust the y position for each row to be directly above the previous one
                const currentY = statsStartY - (index * rowHeight);

                // Draw Key cell
                statsPage.drawRectangle({
                    x: 400,
                    y: currentY - rowHeight, // Start the rectangle at the end of the previous row
                    width: keyColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Value cell
                statsPage.drawRectangle({
                    x: 400 + keyColumnWidth,
                    y: currentY - rowHeight, // Align with the Key cell
                    width: valueColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Key text
                statsPage.drawText(key, {
                    x: 405, // Add some padding from the left border
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });

                // Draw Value text
                statsPage.drawText(value.toString(), {
                    x: 405 + keyColumnWidth, // Position text after the key
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });
            });


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

    generatePDFForParty: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;
            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;



            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];



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
                            // const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            // let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap
                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    //  let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        currentPage.drawText(provinceName.toUpperCase(), { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    // const provinceTableX = 60;
                    // const provinceTableY = currentYCoordinate - 150;

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

            // After drawing all member and province tables, add a new page for "Break Up"
            const statsPage = pdfDoc.addPage();
            const { width, height } = statsPage.getSize();
            let statsStartY = height - 50; // Start from the top of the new page

            // Draw the "Break Up" title
            statsPage.drawText("BREAK UP", { x: 400, y: statsStartY, font: fontBold, ...textOptions1 });
            statsStartY -= 20; // Add some space before starting the stats table

            // Draw table for "Overall Stats"
            const statsEntries = Object.entries(attendance.overallStats);
            const keyColumnWidth = 80; // Adjust the width as needed
            const valueColumnWidth = 50; // Adjust the width as needed
            const rowHeight = 20; // Height of each row in the table

            statsEntries.forEach(([key, value], index) => {
                // Adjust the y position for each row to be directly above the previous one
                const currentY = statsStartY - (index * rowHeight);

                // Draw Key cell
                statsPage.drawRectangle({
                    x: 400,
                    y: currentY - rowHeight, // Start the rectangle at the end of the previous row
                    width: keyColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Value cell
                statsPage.drawRectangle({
                    x: 400 + keyColumnWidth,
                    y: currentY - rowHeight, // Align with the Key cell
                    width: valueColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Key text
                statsPage.drawText(key, {
                    x: 405, // Add some padding from the left border
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });

                // Draw Value text
                statsPage.drawText(value.toString(), {
                    x: 405 + keyColumnWidth, // Position text after the key
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });
            });


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

    // Get Session Sitting Attendance By Single Party
    getSessionSittingAttendanceBySingleParty: async (manageSessionId, partyName) => {
        try {
            const attendanceData = {}
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            const politicalParty = await PoliticalParties.findOne({
                where: { id: partyName },
                attributes: ['id', 'partyName', 'shortName'],
            });
            console.log(politicalParty)
            // Fetch members from the current province
            const members = await Members.findAll({
                where: { politicalParty: politicalParty.id },
                attributes: ['id', 'memberName', 'politicalParty', 'memberProvince'],
            });

            console.log(members)

            // Initialize the array for the current province's attendance data
            //  attendanceDataByProvince[politicalParty] = [];
            const partyNamesMap = {};
            for (const member of members) {
                if (!partyNamesMap[member.politicalParty]) {
                    const party = await PoliticalParties.findOne({
                        where: { id: member.politicalParty },
                        attributes: ['id', 'partyName', 'shortName'],
                    });
                    if (party) {
                        partyNamesMap[member.politicalParty] = party.partyName;
                    }
                }
            }

            // Fetch attendance for each member in the province
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

            return response
        } catch (error) {
            throw { message: error.message || "Error Retrieving Attendance By Party!" };
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
    getSessionSittingAttendanceBySingleMember: async (manageSessionId, memberName) => {
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

            const members = await Members.findOne({
                where: { id: memberName },
                attributes: ['id', 'memberName', 'politicalParty', 'memberProvince'],
            });

            // Fetch members belonging to the specified political party and province
            const politicalParty = await PoliticalParties.findOne({
                where: { id: members.politicalParty },
                attributes: ['id', 'partyName', 'shortName'],
            });
            if (!politicalParty) {
                throw new Error("Political Party Not Found!");
            }

            // Initialize attendanceData for the province
            attendanceData[members.memberProvince] = {};

            // Fetch attendance for each member in the province
            // for (const member of members) {
            const attendanceRecord = await SessionAttendance.findOne({
                where: {
                    fkManageSessionId: manageSessionId,
                    fkMemberId: members.id,
                },
                attributes: ['attendanceStatus'],
            });

            const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

            // Add the member's attendance data with the party name
            const partyName = politicalParty.partyName;

            if (!attendanceData[members.memberProvince][partyName]) {
                attendanceData[members.memberProvince][partyName] = [];
            }
            attendanceData[members.memberProvince][partyName].push({
                memberId: members.id,
                memberName: members.memberName,
                attendanceStatus: attendanceStatus,
            });

            // Update overall stats
            if (overallStats.hasOwnProperty(attendanceStatus)) {
                overallStats[attendanceStatus]++;
            } else {
                overallStats[attendanceStatus] = 1;
            }
            overallStats.Total++;
            //    }

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

    // Generate PDF For Session SItting Attendance By Member Name
    generatedPDFForSingleMember: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;
            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;



            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    // console.log(provinceData)
                    const partyName = Object.keys(provinceData)[0]; // Get the party name
                    //console.log(partyName);

                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData[partyName].length + 1;
                    const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

                    if (!isFirstProvince) {
                        const shouldAddPage = provinceName !== 'overallStats';
                        if (shouldAddPage) {
                            pdfDoc.addPage(); // Add a new page for provinces other than the first one
                        } else {
                            // const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            // let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap
                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    // let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        //console.log(provinceName)
                        currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    //  const provinceTableX = 60;
                    // const provinceTableY = currentYCoordinate - 150;




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
                    //  console.log("HAJHSBDJ", provinceData[partyName])
                    for (let row = 0; row < provinceData[partyName].length; row++) {
                        const attend = provinceData[partyName][row];
                        currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                        globalRowCounter++;
                    }
                }
            }

            // let statsStartY = provinceTableY - ([attendance].length * 30) - 40; // Add some space between the tables
            // // Draw the "Overall Stats" title
            // page.drawText("Overall Stats", { x: provinceTableX + 300, y: statsStartY, ...textOptions });
            // statsStartY -= 20; // Move down to start drawing stats

            // // Assuming you want to draw the stats in two columns: Key and Value
            // const statsEntries = Object.entries(attendance.overallStats);
            // statsEntries.forEach(([key, value], index) => {
            //     // Draw Key
            //     page.drawText(key, { x: provinceTableX + 300 , y: statsStartY - (index * 15), ...textOptions });
            //     // Draw Value, aligned to the right of the Key
            //     page.drawText(value.toString(), { x: provinceTableX + 400, y: statsStartY - (index * 15), ...textOptions });
            // });
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

    // Get Session Sitting Attendance By Province and Party Name
    getSessionSittingAttendanceByProvinceParty: async (manageSessionId, partyName, province) => {
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
            if (!partyName || !province) {
                throw new Error("Please provide both partyName and province.");
            }

            // Fetch members belonging to the specified political party and province
            const politicalParty = await PoliticalParties.findOne({
                where: { id: partyName },
                attributes: ['id', 'partyName', 'shortName'],
            });
            if (!politicalParty) {
                throw new Error("Political Party Not Found!");
            }

            const members = await Members.findAll({
                where: { politicalParty: partyName, memberProvince: province },
                attributes: ['id', 'memberName', 'politicalParty', 'memberProvince'],
            });

            // Initialize attendanceData for the province
            attendanceData[province] = {};

            // Fetch attendance for each member in the province
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
                const partyName = politicalParty.partyName;

                if (!attendanceData[province][partyName]) {
                    attendanceData[province][partyName] = [];
                }
                attendanceData[province][partyName].push({
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

    // Generate PDF For Session Sitting Attendance By Province and Party
    generatedPDFForProvinceParty: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;


            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;
            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    // console.log(provinceData)
                    const partyName = Object.keys(provinceData)[0]; // Get the party name
                    //console.log(partyName);

                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData[partyName].length + 1;
                    const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

                    if (!isFirstProvince) {
                        const shouldAddPage = provinceName !== 'overallStats';
                        if (shouldAddPage) {
                            pdfDoc.addPage(); // Add a new page for provinces other than the first one
                        } else {
                            //const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            // let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap
                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    // const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    //let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        //console.log(provinceName)
                        currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });
                    }


                    // Draw table for province
                    // const provinceTableX = 60;
                    //const provinceTableY = currentYCoordinate - 150;




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
                    //  console.log("HAJHSBDJ",provinceData[partyName])
                    for (let row = 0; row < provinceData[partyName].length; row++) {
                        const attend = provinceData[partyName][row];
                        currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                        globalRowCounter++;
                    }
                }
            }

            const statsPage = pdfDoc.addPage();
            const { width, height } = statsPage.getSize();
            let statsStartY = height - 50; // Start from the top of the new page

            // Draw the "Break Up" title
            statsPage.drawText("BREAK UP", { x: 400, y: statsStartY, font: fontBold, ...textOptions1 });
            statsStartY -= 20; // Add some space before starting the stats table

            // Draw table for "Overall Stats"
            const statsEntries = Object.entries(attendance.overallStats);
            const keyColumnWidth = 80; // Adjust the width as needed
            const valueColumnWidth = 50; // Adjust the width as needed
            const rowHeight = 20; // Height of each row in the table

            statsEntries.forEach(([key, value], index) => {
                // Adjust the y position for each row to be directly above the previous one
                const currentY = statsStartY - (index * rowHeight);

                // Draw Key cell
                statsPage.drawRectangle({
                    x: 400,
                    y: currentY - rowHeight, // Start the rectangle at the end of the previous row
                    width: keyColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Value cell
                statsPage.drawRectangle({
                    x: 400 + keyColumnWidth,
                    y: currentY - rowHeight, // Align with the Key cell
                    width: valueColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Key text
                statsPage.drawText(key, {
                    x: 405, // Add some padding from the left border
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });

                // Draw Value text
                statsPage.drawText(value.toString(), {
                    x: 405 + keyColumnWidth, // Position text after the key
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });
            });

            // Save the PDF to a file with a dynamic name
            const outputFileName = `output_${Date.now()}.pdf`;
            const pdfBytes = await pdfDoc.save(outputFileName);
            //await fs.writeFile(outputFileName, pdfBytes);


            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error.message);
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
                        attributes: ['id', 'partyName', 'shortName'],
                    });
                    if (party) {
                        partyNamesMap[member.politicalParty] = party.partyName;
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

    // Generate PDF For Session SItting By Party Name and Member
    generatedPDFForPartyMember: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;



            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    // console.log(provinceData)
                    // const partyName = Object.keys(provinceData)[0]; // Get the party name
                    //console.log(partyName);

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
                        //console.log(provinceName)
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

    // Get Session Sitting Attendance By Province and Member Name
    getSessionSittingAttendanceByProvinceMember: async (manageSessionId, province, memberName) => {
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

    // Generate PDF For Session Sitting By Province and Member Name
    generatedPDFForProvinceMember: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;



            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    // console.log(provinceData)
                    // const partyName = Object.keys(provinceData)[0]; // Get the party name
                    //console.log(partyName);

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
                        //console.log(provinceName)
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
                        attributes: ['id', 'partyName', 'shortName'],
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

    // Generate PDF For Session Sitting by Party, Province and Member Name
    generatedPDFForPartyProvinceMember: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;
            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;


            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    //console.log(provinceData)
                    const partyName = Object.keys(provinceData)[0]; // Get the party name
                    console.log(partyName);

                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData[partyName].length + 1;
                    const tableHeight = provinceNumRows * 20 + 20; // 20 for additional vertical gap

                    if (!isFirstProvince) {
                        const shouldAddPage = provinceName !== 'overallStats';
                        if (shouldAddPage) {
                            pdfDoc.addPage(); // Add a new page for provinces other than the first one
                        } else {
                            //  const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                            //    let currentYCoordinate = currentPage.getHeight() - 50;
                            currentYCoordinate -= padding; // Add an extra vertical gap
                        }
                    } else {
                        isFirstProvince = false; // Set the flag to false after the first province
                    }



                    // Add province name as a heading
                    //const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
                    //let currentYCoordinate = currentPage.getHeight() - 50;
                    if (provinceName == 'overallStats') {
                        //currentPage.drawText(provinceName.toUpperCase(), { x: 400, y: currentYCoordinate - 325, ...textOptions });
                    } else {
                        //console.log(provinceName)
                        // currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });
                        currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });

                    }


                    // Draw table for province
                    //  const provinceTableX = 60;
                    //   const provinceTableY = currentYCoordinate - 150;




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

                    for (let row = 0; row < provinceData[partyName].length; row++) {
                        const attend = provinceData[partyName][row];
                        currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                        globalRowCounter++;
                    }
                }
            }
            let statsStartY = provinceTableY - ([attendance].length * 30) - 40; // Add some space between the tables
            // Draw the "Overall Stats" title
            page.drawText("Overall Stats", { x: provinceTableX + 300, y: statsStartY, ...textOptions });
            statsStartY -= 20; // Move down to start drawing stats

            // Assuming you want to draw the stats in two columns: Key and Value
            const statsEntries = Object.entries(attendance.overallStats);
            statsEntries.forEach(([key, value], index) => {
                // Draw Key
                page.drawText(key, { x: provinceTableX + 300, y: statsStartY - (index * 15), ...textOptions });
                // Draw Value, aligned to the right of the Key
                page.drawText(value.toString(), { x: provinceTableX + 400, y: statsStartY - (index * 15), ...textOptions });
            });

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
                        attributes: ['id', 'partyName', 'shortName'],
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

    // Generate PDF For Session Sittings
    generatedPDFForSessionSitting: async (attendance, fetchedSession) => {
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
            page.drawText(`Province-wise Attendance of Senators during the Senate Session held on ${moment(fetchedSession.sittingDate).format("DD-MM-YYYY")}`, { x: 110, y: yCoordinate + verticalGap - 100, font: fontBold, ...textOptions1 });


            // ...

            const padding = 20;
            let isFirstProvince = true; // Flag to track if it's the first province
            let isErstwhileFATA = false;
            let globalRowCounter = 1;
            const currentPage = pdfDoc.getPage(pdfDoc.getPages().length - 1); // Get the current page
            let currentYCoordinate = currentPage.getHeight() - 50;

            const provinceTableX = 60;
            const provinceTableY = currentYCoordinate - 150;


            for (const provinceName in attendance) {

                if (attendance.hasOwnProperty(provinceName)) {
                    const provinceData = attendance[provinceName];
                    //console.log(provinceData)
                    const partyName = Object.keys(provinceData)[0]; // Get the party name
                    console.log(partyName);

                    if (provinceData.length === 0) {
                        // Skip drawing the table if there is no data
                        continue;
                    }

                    const provinceNumRows = provinceData[partyName].length + 1;
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
                        //console.log(provinceName)
                        // currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });
                        currentPage.drawText(`${provinceName.toUpperCase()} - ${partyName.toUpperCase()}`, { x: 245, y: currentYCoordinate - 125, ...textOptions });

                    }


                    // Draw table for province
                    //   const provinceTableX = 60;
                    // const provinceTableY = currentYCoordinate - 150;




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

                    for (let row = 0; row < provinceData[partyName].length; row++) {
                        const attend = provinceData[partyName][row];
                        currentPage.drawText(`${globalRowCounter}`, { x: provinceTableX + 5, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.memberName, { x: provinceTableX + 165, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });
                        currentPage.drawText(attend.attendanceStatus, { x: provinceTableX + 370, y: provinceTableY - (row + 1) * 20 + 5, ...textOptions });

                        globalRowCounter++;
                    }
                }
            }
            const statsPage = pdfDoc.addPage();
            const { width, height } = statsPage.getSize();
            let statsStartY = height - 50; // Start from the top of the new page

            // Draw the "Break Up" title
            statsPage.drawText("BREAK UP", { x: 400, y: statsStartY, font: fontBold, ...textOptions1 });
            statsStartY -= 20; // Add some space before starting the stats table

            // Draw table for "Overall Stats"
            const statsEntries = Object.entries(attendance.overallStats);
            const keyColumnWidth = 80; // Adjust the width as needed
            const valueColumnWidth = 50; // Adjust the width as needed
            const rowHeight = 20; // Height of each row in the table

            statsEntries.forEach(([key, value], index) => {
                // Adjust the y position for each row to be directly above the previous one
                const currentY = statsStartY - (index * rowHeight);

                // Draw Key cell
                statsPage.drawRectangle({
                    x: 400,
                    y: currentY - rowHeight, // Start the rectangle at the end of the previous row
                    width: keyColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Value cell
                statsPage.drawRectangle({
                    x: 400 + keyColumnWidth,
                    y: currentY - rowHeight, // Align with the Key cell
                    width: valueColumnWidth,
                    height: rowHeight,
                    borderColor: rgb(0, 0, 0),
                    borderWidth: 1,
                });

                // Draw Key text
                statsPage.drawText(key, {
                    x: 405, // Add some padding from the left border
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });

                // Draw Value text
                statsPage.drawText(value.toString(), {
                    x: 405 + keyColumnWidth, // Position text after the key
                    y: currentY - rowHeight + 5, // Adjust for text placement within the cell
                    ...textOptions
                });
            });


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




    // Get Attendance Data By Session
    getAttendanceBySession: async (sessionId) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch all members
            const members = await Members.findAll({
                attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            });

            if (!members || members.length === 0) {
                throw new Error("Members not found");
            }

            // Fetch all parties
            const parties = await PoliticalParties.findAll({
                attributes: ['id', 'partyName', 'shortName'],
            });

            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'endDate', 'isQuoraumAdjourned']
            })


            if (!parties || parties.length === 0) {
                throw new Error("Parties not found");
            }

            // Fetch sitting days for the session
            const { count, rows } = await ManageSessions.findAndCountAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });


            // const sittingStartTime = moment(rows.sittingStartTime, "h:mm A");
            // const sittingEndTime = moment(rows.sittingEndTime, "h:mm A");
            // const sittingDuration = moment.duration(sittingEndTime.diff(sittingStartTime));
            // const sittingMinutes = sittingDuration.asMinutes();
            // const sittingTotalTime = `${Math.floor(sittingMinutes / 60)}h:${sittingMinutes % 60}m`;
            // const sittingInWords = await manageSessionsService.minutesToWords(sittingMinutes);
            let totalMinutes = 0;

            rows.forEach(sitting => {
                const sittingStartTime = moment(sitting.sittingStartTime, "h:mm A");
                const sittingEndTime = moment(sitting.sittingEndTime, "h:mm A");
                const sittingDuration = moment.duration(sittingEndTime.diff(sittingStartTime));
                totalMinutes += sittingDuration.asMinutes(); // Sum up the minutes from each sitting
            });

            const totalHours = Math.floor(totalMinutes / 60);
            const remainingMinutes = totalMinutes % 60;
            const totalTimeFormatted = `${totalHours} Hours ${remainingMinutes} Minutes`;



            for (const member of members) {
                const provinceName = member.memberProvince;


                for (const sittingDay of rows) {
                    const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                    // Initialize nested structure for date, province, and party if they don't exist
                    attendanceByDate[date] = attendanceByDate[date] || {};

                    if (!attendanceByDate[date][provinceName]) {
                        attendanceByDate[date][provinceName] = [];
                    }
                    // attendanceByDate[date][provinceName] = attendanceByDate[date][provinceName] || {};
                    // attendanceByDate[date][provinceName][partyName] = attendanceByDate[date][provinceName][partyName] || [];

                    // Check for an attendance record for the member on the sitting day
                    const attendanceRecord = await SessionAttendance.findOne({
                        where: {
                            fkManageSessionId: sittingDay.id,
                            fkMemberId: member.id,
                        },
                        attributes: ['attendanceStatus'],
                    });

                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';
                    // Add member attendance data
                    attendanceByDate[date][provinceName].push({
                        memberId: member.id,
                        memberName: member.memberName,
                        attendanceStatus: attendanceStatus,
                    });

                    // Update overall stats
                    overallStats[attendanceStatus]++;
                    overallStats.Total++;
                }
            }

            return {
                sittingTotalDuration: totalTimeFormatted,
                sittingsCount: count,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSession: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage([1192, 1000]);
            let secondLastPage
            let yCoordinate = page.getHeight() - 50;
            const grayBackground = rgb(0.75, 0.75, 0.75);
            const textOptions = { font, color: rgb(0, 0, 0), size: 16 };
            const textOptions2 = { font, color: rgb(0, 0, 0), size: 12 }
            const boldTextOptions = { ...textOptions, font: fontBold };
            const verticalGap = 10;
            page.drawText('SENATE SECRETARIAT', { x: 520, y: yCoordinate + verticalGap + 10, ...boldTextOptions });
            page.drawText('(NOTICE-OFFICE)', { x: 550, y: yCoordinate - 10, ...boldTextOptions });
            page.drawText(`ATTENDANCE SUMMARY OF SESSION NO. ${attendance.sessionDetails.sessionName} (${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")} to ${moment(attendance.sessionDetails.endDate).format("DD-MM-YYYY")})`, { x: 350, y: yCoordinate - 40, ...boldTextOptions });

            const organizedData = {};
            let crossProvincePresentTotals = {};
            let crossProvincePresentTotalsWithMonth = {};
            let crossProvinceAbsentTotals = {};
            let crossProvinceLeaveTotals = {}
            for (const dateKey in attendance) {
                if (dateKey !== 'sittingTotalDuration' && dateKey !== 'sittingsCount' && dateKey !== 'sessionDetails' && dateKey !== 'overallStats' && dateKey !== 'fileLink') {
                    const date = new Date(dateKey);
                    const monthYearKey = `${date.getMonth() + 1}-${date.getFullYear()}`; // e.g., "4-2024"
                    if (!organizedData[monthYearKey]) {
                        organizedData[monthYearKey] = {};
                    }
                    const day = date.getDate();
                    for (const province in attendance[dateKey]) {
                        if (!organizedData[monthYearKey][province]) {
                            organizedData[monthYearKey][province] = {};
                        }
                        attendance[dateKey][province].forEach(member => {
                            if (!organizedData[monthYearKey][province][member.memberName]) {
                                organizedData[monthYearKey][province][member.memberName] = {};
                            }
                            organizedData[monthYearKey][province][member.memberName][day] = member.attendanceStatus;
                        });
                    }
                }
            }
            const statusShortMap = {
                Present: 'P',
                Absent: 'A',
                Leave: 'L'
            };
            const reverseStatusMap = {
                P: 'Present',
                A: 'Absent',
                L: 'Leave'
            };
            for (const monthYear in organizedData) {
                const monthNames = [
                    "Jan", "Feb", "March", "April", "May", "June",
                    "July", "Aug", "Sept", "Oct", "Nov", "Dec"
                ];

                let [month, year] = monthYear.split('-');
                month = parseInt(month) - 1; // Convert to zero-based index
                let monthName = monthNames[month];
                let formattedMonthYear = `${monthName}-${year}`;

                page.drawText(`Month-Year: ${formattedMonthYear}`, { x: 520, y: yCoordinate - 70, ...boldTextOptions });

                for (const province in organizedData[monthYear]) {
                    page.drawText(`Province: ${province}`, { x: 550, y: yCoordinate - 100, ...boldTextOptions });
                    yCoordinate -= 10;

                    // Headers for table
                    page.drawText("Ser. No.", { x: 100, y: yCoordinate - 160, ...textOptions });
                    page.drawText("Name Of the Senator", { x: 200, y: yCoordinate - 160, ...textOptions });
                    page.drawText(`${formattedMonthYear}`, { x: 400, y: yCoordinate - 160, ...textOptions })
                    // page.drawText(`Total`, { x: 640, y: yCoordinate - 160, ...textOptions })
                    let daysSet = new Set();
                    Object.values(organizedData[monthYear][province]).forEach(member => {
                        Object.keys(member).forEach(day => daysSet.add(day));
                    });

                    const startX = 90;
                    const startY = yCoordinate - 170
                    const columnWidth = 540;
                    const rowHeight = 25;

                    // Draw headers for the first entry or new page
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });

                    let sortedDays = Array.from(daysSet).sort((a, b) => a - b);
                    const dayLabelWidth = 50;
                    const gapAfterDays = 30;

                    let startXLable = 410 + (sortedDays.length * dayLabelWidth) + gapAfterDays;

                    let xCoord = 405;
                    const dayGap = 50;
                    //                    let lowestY = yCoordinate - 175;

                    page.drawText("Total", { x: startXLable + 70, y: yCoordinate - 160, ...textOptions });
                    page.drawText(`Present`, { x: startXLable + 60, y: yCoordinate - 190, ...textOptions })
                    page.drawText(`Absent`, { x: startXLable + 140, y: yCoordinate - 190, ...textOptions })
                    page.drawText(`Leave`, { x: startXLable + 220, y: yCoordinate - 190, ...textOptions })

                    const startX1 = 380;
                    const startY1 = yCoordinate - 195;
                    const columnWidth1 = 395;
                    const rowHeight1 = 25;

                    page.drawRectangle({
                        x: startX1,
                        y: startY1,
                        width: columnWidth1 * 2,
                        height: rowHeight1,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });


                    let dayCounters = {};
                    let totalCounts = { P: 0, A: 0, L: 0 };
                    let serialNo = 1;

                    // sortedDays.forEach((day, index) => {
                    //     page.drawText(`${day}`, { x: xCoord, y: yCoordinate - 190, ...textOptions });
                    //     const startY = yCoordinate - 170;
                    //     // Draw a line after this day's label
                    //     if (index > 0) {  
                    //         const lineX = xCoord - dayGap / 2;
                    //         const startLineY = startY;  
                    //         console.log("Start Line",startLineY)
                    //         const endLineY = lowestY; 
                    //         console.log("End Line",endLineY) 

                    //         page.drawLine({
                    //             start: { x: lineX, y: startLineY },
                    //             end: { x: lineX, y: endLineY },
                    //             thickness: 1,
                    //             color: rgb(0, 0, 0)
                    //         });
                    //     }
                    //     xCoord += dayGap; 
                    // });
                    let endPositions = [];  // to store positions for lines

                    sortedDays.forEach((day, index) => {
                        page.drawText(`${day}`, { x: xCoord - 5, y: yCoordinate - 190, ...textOptions });
                        if (index > 0) {  // store position for line drawing later
                            endPositions.push(xCoord - dayGap / 2);
                        }
                        xCoord += dayGap; // Move to the next day position
                    });

                    let lowestY = yCoordinate - 25;  // Start with the initial yCoordinate

                    for (const memberName in organizedData[monthYear][province]) {
                        let memberAttendanceCounts = { P: 0, A: 0, L: 0 };
                        let daysStatuses = [];
                        let daysAttendance = Object.entries(organizedData[monthYear][province][memberName]).map(([day, status]) => {
                            return statusShortMap[status] || status;
                        }).join('          ');

                        Object.entries(organizedData[monthYear][province][memberName]).forEach(([day, status]) => {
                            if (!dayCounters[day]) dayCounters[day] = { P: 0, A: 0, L: 0 };
                            let shortStatus = statusShortMap[status] || status;
                            dayCounters[day][shortStatus]++;
                            memberAttendanceCounts[shortStatus]++;
                            totalCounts[shortStatus]++;
                            daysStatuses.push(shortStatus);
                            if (status === 'Present' || status === 'P') {
                                if (!crossProvincePresentTotals[day]) {
                                    crossProvincePresentTotals[day] = 0;
                                    let newKey = `${day}-${monthName}`;
                                    crossProvincePresentTotalsWithMonth[newKey] = crossProvincePresentTotals[day];
                                }
                                crossProvincePresentTotals[day]++;
                            }
                            if (status === 'Absent' || status === 'A') {
                                if (!crossProvinceAbsentTotals[day]) {
                                    crossProvinceAbsentTotals[day] = 0;
                                }
                                crossProvinceAbsentTotals[day]++;
                            }
                            if (status === 'Leave' || status === 'L') {
                                if (!crossProvinceLeaveTotals[day]) {
                                    crossProvinceLeaveTotals[day] = 0;
                                }
                                crossProvinceLeaveTotals[day]++;
                            }
                            return shortStatus;
                        });

                        // Check if absent or on leave for all days
                        if (memberAttendanceCounts.P === 0 && (memberAttendanceCounts.A > 0 || memberAttendanceCounts.L > 0)) {
                            page.drawRectangle({
                                x: 90,
                                y: yCoordinate - 220,
                                width: daysAttendance.length * 32,
                                height: 22,
                                color: grayBackground,
                            });
                        }

                        else if (memberAttendanceCounts.A > 0 || memberAttendanceCounts.L > 0) {

                            const dayWidth = 50;
                            const daysStartX = 380;

                            daysStatuses.forEach((status, index) => {
                                let dayX = daysStartX + index * dayWidth;

                                // Draw grey rectangle for Absent or Leave days
                                if (status === 'A' || status === 'L') {
                                    page.drawRectangle({
                                        x: dayX,
                                        y: yCoordinate - 220,
                                        width: dayWidth,
                                        height: 22,
                                        color: grayBackground,
                                    });
                                }
                            });
                        }

                        const gapAfterDays1 = 30;
                        let startXLable1 = 400 + (sortedDays.length * 50) + gapAfterDays1;
                        let memberDataY = yCoordinate - 215;
                        page.drawText(`${serialNo}`, { x: 100, y: memberDataY, ...textOptions });
                        page.drawText(` ${memberName}`, { x: 150, y: memberDataY, ...textOptions });
                        // yCoordinate -= 25; // Decrease yCoordinate for each new row
                        // Adjust this based on your row height
                        const serialNoX = 100; // X-coordinate for "Serial No."
                        const memberNameX = 150; // X-coordinate for "Member Name"
                        const lineX = Math.ceil(serialNoX + memberNameX) / 2; // Position line between the two columns
                        //   yCoordinate -= 25; // Decrease yCoordinate for each new row

                        // Update lowestY to be the last row's y-coordinate
                        //lowestY = yCoordinate - 25; // Adjust this based on your row height
                        const startY = yCoordinate - 195; // Starting y-coordinate for the line
                        const endY = startY - 25; // End y-coordinate for the line, making the line 25 units long
                        lowestY = memberDataY;
                        // Draw the vertical line
                        page.drawLine({
                            start: { x: lineX, y: startY },
                            end: { x: lineX, y: endY },
                            thickness: 1, // Set the line thickness
                            color: rgb(0, 0, 0) // Set the line color to black
                        });


                        const startLineY = yCoordinate - 195; // Starting y-coordinate for the line
                        const endY1 = startY - 25; // End y-coordinate for the line, making the line 25 units long

                        // Draw the vertical line
                        page.drawLine({
                            start: { x: 380, y: startLineY },
                            end: { x: 380, y: endY1 },
                            thickness: 1, // Set the line thickness
                            color: rgb(0, 0, 0) // Set the line color to black
                        });

                        page.drawText(` ${daysAttendance}`, { x: 400, y: yCoordinate - 215, ...textOptions });



                        // Display attendance counts for each member
                        page.drawText(`${memberAttendanceCounts.P}`, { x: startXLable1 + 80, y: yCoordinate - 215, ...textOptions });
                        page.drawText(`${memberAttendanceCounts.A}`, { x: startXLable1 + 160, y: yCoordinate - 215, ...textOptions });
                        page.drawText(`${memberAttendanceCounts.L}`, { x: startXLable1 + 240, y: yCoordinate - 215, ...textOptions });

                        // Define the y-coordinates for the vertical lines
                        const lineStartY = yCoordinate - 195;  // Adjust as necessary to match the height of your rows
                        const lineEndY = lineStartY - 25;     // Adjust based on how tall you want the lines

                        // Calculate line positions
                        const line1X = startXLable1 + 70; // Before P
                        const line2X = startXLable1 + 150; // Between P and A
                        const line3X = startXLable1 + 230; // Between A and L
                        const line4X = startXLable1 + 310; // After L

                        // Draw the lines
                        page.drawLine({
                            start: { x: line1X, y: lineStartY },
                            end: { x: line1X, y: lineEndY },
                            thickness: 1,
                            color: rgb(0, 0, 0)
                        });
                        page.drawLine({
                            start: { x: line2X, y: lineStartY },
                            end: { x: line2X, y: lineEndY },
                            thickness: 1,
                            color: rgb(0, 0, 0)
                        });
                        page.drawLine({
                            start: { x: line3X, y: lineStartY },
                            end: { x: line3X, y: lineEndY },
                            thickness: 1,
                            color: rgb(0, 0, 0)
                        });
                        page.drawLine({
                            start: { x: line4X, y: lineStartY },
                            end: { x: line4X, y: lineEndY },
                            thickness: 1,
                            color: rgb(0, 0, 0)
                        });


                        const startX1 = 90;
                        const startY1 = yCoordinate - 220;
                        const columnWidth1 = 540;
                        const rowHeight1 = 25;

                        page.drawRectangle({
                            x: startX1,
                            y: startY1,
                            width: columnWidth1 * 2,
                            height: rowHeight1,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        // Now draw vertical lines
                        const startLineY3 = yCoordinate - 173;  // Top of the content area
                        endPositions.forEach(lineX => {
                            page.drawLine({
                                start: { x: lineX, y: startLineY3 },
                                end: { x: lineX, y: lowestY },  // Draw down to the last member row
                                thickness: 1,
                                color: rgb(0, 0, 0)
                            });
                        });


                        yCoordinate -= 25;
                        serialNo++;
                    }




                    // Draw daily breakdown for each status
                    Object.keys(totalCounts).forEach((status, index) => {
                        let dailyDetails = Object.entries(dayCounters).map(([day, counts]) => counts[status] || 0);
                        page.drawText(`Total ${reverseStatusMap[status]}`, { x: 140, y: yCoordinate - 215, ...textOptions });
                        let detailX = 400;
                        let detailX1 = 440;
                        dailyDetails.forEach((detail, detailIndex) => {
                            page.drawText(detail.toString(), { x: detailX + detailIndex * 50, y: yCoordinate - 215, ...textOptions });

                            // Draw lines between details but not before the first or after the last
                            if (detailIndex < dailyDetails.length - 1) { // Check ensures no line is drawn after the last element
                                //const lineX = detailX1 + (detailIndex * 60) ; // Position of the line between this element and the next
                                const lineX = 400 + (detailIndex * 50) + 30;

                                const startY1 = yCoordinate - 200;
                                const endY1 = startY1 - 25; // Adjust according to the height of the area covered by the text

                                page.drawLine({
                                    start: { x: lineX, y: startY1 },
                                    end: { x: lineX, y: endY1 },
                                    thickness: 1,
                                    color: rgb(0, 0, 0)
                                });
                            }
                        });

                        yCoordinate -= 20; // Adjust y-coordinate for the next set of content

                        const rectangleHeight = 25; // Height of the rectangle
                        const rowHeight2 = rectangleHeight;
                        const startY2 = yCoordinate - 205; // Adjust start Y taking new height into account
                        let columnWidth2;
                        if (dailyDetails.length > 1) {
                            columnWidth2 = dailyDetails.length * 50;
                        }
                        else {
                            columnWidth2 = 200;
                        }

                        page.drawRectangle({
                            x: 125,
                            y: startY2,
                            width: columnWidth2 * 2,
                            height: rowHeight2,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });

                        yCoordinate -= rectangleHeight - 20; // Further adjust y-coordinate for the next content based on new rectangle height

                        const startY = yCoordinate - 170;
                        const endY = startY - 25;
                        page.drawLine({
                            start: { x: 380, y: startY },
                            end: { x: 380, y: endY },
                            thickness: 1,
                            color: rgb(0, 0, 0)
                        });
                    });


                    page = pdfDoc.addPage([1192, 1000]);
                    const pages = pdfDoc.getPages();

                    // Check if there are at least two pages
                    if (pages.length < 2) {
                        throw new Error('The document does not have enough pages.');
                    }

                    // Get the second to last page
                    secondLastPage = pages[pages.length - 2];
                    yCoordinate = page.getHeight() - 1;


                }
            }


            const sortedDays1 = Object.keys(crossProvincePresentTotals).sort((a, b) => new Date(a) - new Date(b));
            let allPresentCounts = Object.values(crossProvincePresentTotals);
            let maxAttendance = Math.max(...allPresentCounts);
            let minAttendance = Math.min(...allPresentCounts);
            const sortedDays2 = Object.keys(crossProvinceAbsentTotals).sort((a, b) => new Date(a) - new Date(b));
            const sortedDays3 = Object.keys(crossProvinceLeaveTotals).sort((a, b) => new Date(a) - new Date(b));

            const startX = 400; // Initial horizontal position for the first column
            let dayX = startX; // Horizontal position tracker for headers
            const months = ["Jan", "Feb", "March", "April", "May", "June",
                "July", "Aug", "Sept", "Oct", "Nov", "Dec"];

            const formattedDates = Object.keys(crossProvincePresentTotalsWithMonth).sort((a, b) => new Date(a.split('-')[1], months.indexOf(a.split('-')[0])) - new Date(b.split('-')[1], months.indexOf(b.split('-')[0])));
            // Starting X coordinate for day-month labels
            let dayMonthX = 400; // Adjust this starting point based on your layout
            const dayMonthY = yCoordinate - 420; // Position Y coordinate for day-month labels

            let endPositions = [];
            // Draw Day-Month labels
            formattedDates.forEach((date, index) => {
                const textX = dayMonthX + index * 60; // Adjust position as needed for each date label
                secondLastPage.drawText(date, { x: textX, y: dayMonthY, ...textOptions2 });
                const dayOnly = date.split('-')[0]; // This should give you the day part of the date like '24' from '24-April'
                // Use the dayOnly to fetch the absent count
                let absentCount = crossProvinceAbsentTotals[dayOnly] || 0;  // Now correctly accessing using the day as the key
                let leaveCount = crossProvinceLeaveTotals[dayOnly] || 0;
                let presentCount = crossProvincePresentTotals[dayOnly] || 0
               secondLastPage.drawText(presentCount.toString(), { x: textX, y: yCoordinate - 445, ...textOptions})
                secondLastPage.drawText(absentCount.toString(), { x: textX, y: yCoordinate - 465, ...textOptions });
                secondLastPage.drawText(leaveCount.toString(), { x: textX, y: yCoordinate - 485, ...textOptions });

                if (index < formattedDates.length - 1) { // Ensures no line is drawn after the last element
                    const lineX = textX + 100 / 2; // Halfway between this and the next entry, which is 30 pixels from current
                    const startY1 = yCoordinate - 430;
                    const endY1 = startY1 - 95; // Adjust based on your row height or content area

                    secondLastPage.drawLine({
                        start: { x: lineX, y: startY1 },
                        end: { x: lineX, y: endY1 },
                        thickness: 1,
                        color: rgb(0, 0, 0)
                    });
                }
            });

            // Draw the total row label
            secondLastPage.drawText('Total Attendance Each Sitting', { x: 140, y: yCoordinate - 445, ...textOptions });
            secondLastPage.drawText('Total Absent Each Sitting', { x: 140, y: yCoordinate - 465, ...textOptions })
            secondLastPage.drawText('Total Leave Each Sitting', { x: 140, y: yCoordinate - 485, ...textOptions })
            secondLastPage.drawText('Average Attendance each Sitting', { x: 140, y: yCoordinate - 505, ...textOptions })
            secondLastPage.drawText('Percentage of Attendance each Sitting', { x: 140, y: yCoordinate - 525, ...textOptions })

            const startY = yCoordinate - 430; // Starting y-coordinate for the line
            const endY = startY - 95
            // Draw the vertical line
            secondLastPage.drawLine({
                start: { x: 390, y: startY },
                end: { x: 390, y: endY },
                thickness: 1, // Set the line thickness
                color: rgb(0, 0, 0) // Set the line color to black
            });
            // 2nd Half row label
            secondLastPage.drawText('Maximum Attendance', { x: 400 + (sortedDays1.length * 50) + 50, y: yCoordinate - 445, ...textOptions })
            secondLastPage.drawText('Minimum Attendance', { x: 400 + (sortedDays1.length * 50) + 50, y: yCoordinate - 465, ...textOptions })
            secondLastPage.drawText('Average Attendance', { x: 400 + (sortedDays1.length * 50) + 50, y: yCoordinate - 485, ...textOptions })
            secondLastPage.drawText('Percentage of Attendance', { x: 400 + (sortedDays1.length * 50) + 50, y: yCoordinate - 505, ...textOptions })


            const startY1 = yCoordinate - 435; // Starting y-coordinate for the line
            const endY1 = startY1 - 75
            // Draw the vertical line
            // secondLastPage.drawLine({
            //     start: { x: 745, y: startY1 },
            //     end: { x: 745, y: endY1 },
            //     thickness: 1,
            //     color: rgb(0, 0, 0)
            // });
            
            const startX1 = 130 ;
            const startY10 = yCoordinate - 450;
            const startY19 = yCoordinate - 470;
            const startY20  = yCoordinate - 490;
            const startY21 = yCoordinate - 510;
            const startY22 = yCoordinate - 530;
            const columnWidth10 = 150;
            const rowHeight10 = 20;
            const startX6 = 400 + (sortedDays1.length * 50) + 50;
            const startY6 = yCoordinate - 450;
            const columnWidth6 = 150;
            const rowHeight6 = 20;

            // Total Attendance Each Sitting Rectangle
            secondLastPage.drawRectangle({
                x: startX1,
                y: startY10,
                width: startX6 - startX1,
                height: rowHeight10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Total Absence Each Sitting Rectangle
            secondLastPage.drawRectangle({
                x: startX1,
                y: startY19,
                width: startX6 - startX1,
                height: rowHeight10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Total leave Each Sitting Rectangle
            secondLastPage.drawRectangle({
                x: startX1,
                y: startY20,
                width: startX6 - startX1,
                height: rowHeight10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Average Attendance Each Sitting Rectangle
            secondLastPage.drawRectangle({
                x: startX1,
                y: startY21,
                width: startX6 - startX1,
                height: rowHeight10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });


            // Percentage Of Each Attendance Rectange
            secondLastPage.drawRectangle({
                x: startX1,
                y: startY22,
                width: startX6 - startX1,
                height: rowHeight10,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Maximum Attendance
            secondLastPage.drawText(`${maxAttendance}`, { x: 400 + (sortedDays1.length * 50) + 250, y: yCoordinate - 445, ...textOptions });
           

            secondLastPage.drawRectangle({
                x: startX6,
                y: startY6,
                width: columnWidth6 * 2,
                height: rowHeight6,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });


            // Minimum Attendance
            secondLastPage.drawText(`${minAttendance}`, { x: 400 + (sortedDays1.length * 50) + 250, y: yCoordinate - 465, ...textOptions });

            const startX7 =  400 + (sortedDays1.length * 50) + 50;
            const startY7 = yCoordinate - 470;
            const columnWidth7 = 150;
            const rowHeight7 = 20;

            secondLastPage.drawRectangle({
                x: startX7,
                y: startY7,
                width: columnWidth7 * 2,
                height: rowHeight7,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Average Attendance
            secondLastPage.drawText(`${minAttendance}`, { x: 400 + (sortedDays1.length * 50) + 250 , y: yCoordinate - 485, ...textOptions });

            const startX8 =  400 + (sortedDays1.length * 50) + 50;
            const startY8 = yCoordinate - 490;
            const columnWidth8 = 150;
            const rowHeight8 = 20;

            secondLastPage.drawRectangle({
                x: startX8,
                y: startY8,
                width: columnWidth8 * 2,
                height: rowHeight8,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            // Percentage Of Attendance
            secondLastPage.drawText(`${minAttendance}`, { x: 400 + (sortedDays1.length * 50) + 250, y: yCoordinate - 505, ...textOptions });

            const startX9 =  400 + (sortedDays1.length * 50) + 50;
            const startY9 = yCoordinate - 510;
            const columnWidth9 = 150;
            const rowHeight9 = 20;

            secondLastPage.drawRectangle({
                x: startX9,
                y: startY9,
                width: columnWidth9 * 2,
                height: rowHeight9,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1
            });

            const startX2 = 130;
            const startY2 = yCoordinate - 575;
            const columnWidth2 = 230;
            const rowHeight2 = 20;
            secondLastPage.drawRectangle({
                x: startX2,
                y: startY2,
                width: (columnWidth2 * 2) / 2 + 30,  // Half the width of the second rectangle
                height: rowHeight2,
                color: grayBackground,
            });

            secondLastPage.drawRectangle({
                x: startX2,
                y: startY2,
                width: columnWidth2 * 2,
                height: rowHeight2,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,

            });

            const startY23 = yCoordinate - 435; // Starting y-coordinate for the line
            const endY23 = startY23 - 75
            // Draw the vertical line
            secondLastPage.drawLine({
                start: { x: 400 + (sortedDays1.length * 50) + 230, y: startY23 },
                end: { x: 400 + (sortedDays1.length * 50) + 230, y: endY23 },
                thickness: 1, // Set the line thickness
                color: rgb(0, 0, 0) // Set the line color to black
            });

            secondLastPage.drawText('Total Number Of Sittings', { x: 140, y: yCoordinate - 570, ...textOptions });
            secondLastPage.drawText(`${attendance.sittingsCount}`, { x: 440, y: yCoordinate - 570, ...textOptions });


            const startX3 = 130;
            const startY3 = yCoordinate - 595;
            const columnWidth3 = 230;
            const rowHeight3 = 20;

            secondLastPage.drawRectangle({
                x: startX3,
                y: startY3,
                width: (columnWidth3 * 2) / 2 + 30,  // Half the width of the second rectangle
                height: rowHeight3,
                color: grayBackground,
            });

            secondLastPage.drawRectangle({
                x: startX3,
                y: startY3,
                width: columnWidth3 * 2,
                height: rowHeight3,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,

            });
            secondLastPage.drawText('Total Time Duration', { x: 140, y: yCoordinate - 590, ...textOptions });
            secondLastPage.drawText(`${attendance.sittingTotalDuration}`, { x: 440, y: yCoordinate - 590, ...textOptions });

            const startX4 = 130;
            const startY4 = yCoordinate - 615;
            const columnWidth4 = 230;
            const rowHeight4 = 20;

            secondLastPage.drawRectangle({
                x: startX4,
                y: startY4,
                width: (columnWidth4 * 2) / 2 + 30,  // Half the width of the second rectangle
                height: rowHeight4,
                color: grayBackground,
            });

            secondLastPage.drawRectangle({
                x: startX4,
                y: startY4,
                width: columnWidth4 * 2,
                height: rowHeight4,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,

            });

            secondLastPage.drawText('Session Commenced on', { x: 140, y: yCoordinate - 610, ...textOptions });
            secondLastPage.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 440, y: yCoordinate - 610, ...textOptions });


            const startX5 = 130;
            const startY5 = yCoordinate - 635;
            const columnWidth5 = 230;
            const rowHeight5 = 20;

            secondLastPage.drawRectangle({
                x: startX5,
                y: startY5,
                width: (columnWidth5 * 2) / 2 + 30,  // Half the width of the second rectangle
                height: rowHeight5,
                color: grayBackground,
            });

            secondLastPage.drawRectangle({
                x: startX5,
                y: startY5,
                width: columnWidth5 * 2,
                height: rowHeight5,
                borderColor: rgb(0, 0, 0),
                borderWidth: 1,

            });

            secondLastPage.drawText('Session Prorogued on', { x: 140, y: yCoordinate - 630, ...textOptions });
            secondLastPage.drawText(`${moment(attendance.sessionDetails.endDate).format("DD-MM-YYYY")}`, { x: 440, y: yCoordinate - 630, ...textOptions });


            const startY11 = yCoordinate - 555; // Starting y-coordinate for the line
            const endY3 = startY11 - 75
            // Draw the vertical line
            secondLastPage.drawLine({
                start: { x: 390, y: startY11 },
                end: { x: 390, y: endY3 },
                thickness: 1, // Set the line thickness
                color: rgb(0, 0, 0) // Set the line color to black
            });

            // sortedDays1.forEach(day => {

            //     secondLastPage.drawText(`Day ${day}: ${crossProvincePresentTotals[day]} present`, {
            //         x: 100,
            //         y: yCoordinate,
            //         ...textOptions
            //     });
            //     yCoordinate -= 20; // Move down for next entry
            // });

            // Object.keys(totalCounts).forEach(status => {
            //     let dailyDetails = Object.entries(dayCounters).map(([day, counts]) => counts[status] || 0); // Ensure there's a default value of 0 if undefined
            //     page.drawText(`Total ${reverseStatusMap[status]}`, { x: 140, y: yCoordinate - 245, ...textOptions });
            //     let detailX = 400;

            //     dailyDetails.forEach((detail, index) => {
            //         page.drawText(detail.toString(), { x: detailX + index * 50, y: yCoordinate - 245, ...textOptions });
            //     });
            // })


            const pdfBytes = await pdfDoc.save();
            return pdfBytes;

        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }

    },


    // Get Attendance Data by Session and Member Name
    getAttendanceBySessionMember: async (sessionId, memberName) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };


            // Fetch the member based on memberName
            const member = await Members.findOne({
                where: { id: memberName }, // Assuming memberName is a unique identifier for members
                attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            });

            if (!member) {
                throw new Error("Member not found");
            }

            // Fetch party short name
            const party = await PoliticalParties.findOne({
                where: { id: member.politicalParty },
                attributes: ['id', 'partyName', 'shortName'],
            });

            const partyName = party.partyName;
            const provinceName = member.memberProvince;

            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })
            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][provinceName]) {
                    attendanceByDate[date][provinceName] = {};
                }
                if (!attendanceByDate[date][provinceName][partyName]) {
                    attendanceByDate[date][provinceName][partyName] = [];
                }

                // Check for an attendance record for the member on the sitting day
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: sittingDay.id,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });

                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                // Add member attendance data
                attendanceByDate[date][provinceName]
                [partyName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,

                });

                // Update overall stats
                overallStats[attendanceStatus]++;
                overallStats.Total++;
            }

            return {
                member: member.memberName,
                sessionDetails,
                ...attendanceByDate,
                overallStats,

            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },


    generatedPDFForSessionMember: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senator ${attendance.member} during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 110, y: yCoordinate - 110, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'member') {
                    for (const provinceName in attendance[dateKey]) {
                        for (const partyName in attendance[dateKey][provinceName]) {
                            entries.push({ dateKey, provinceName, partyName, data: attendance[dateKey][provinceName][partyName] });
                        }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { provinceName, partyName } = entries[0];
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;

                let entriesPerPage = 0; // Track number of entries added to the current page
                // let page = pdfDoc.addPage(); // Initialize the first page
                // let yCoordinate = page.getHeight() - 50; // Start at the top of the first page

                entries.forEach((entry, index) => {
                    const { dateKey, data } = entry;

                    // Check if date is valid and data is present
                    if (!moment(dateKey).isValid() || !Array.isArray(data) || data.length === 0) {
                        console.log(`Skipping entry with invalid date or no data: ${dateKey}`);
                        return; // Skip this iteration if date is invalid or data is empty
                    }

                    // Decide if a new page is needed
                    if (entriesPerPage >= 4) { // If the current page is full
                        page = pdfDoc.addPage(); // Start a new page
                        yCoordinate = page.getHeight() - 50; // Reset y-coordinate to the top of the new page
                        entriesPerPage = 0; // Reset the entries per page counter
                    }

                    // Draw the date and reset layout coordinates
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });

                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;

                    // Draw headers for the first entry or new page
                    //if (entriesPerPage === 0) { // Only draw headers on the first entry of each page
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    //}

                    // Draw member details
                    data.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight; // Move down for the next row
                    });

                    // Update y-coordinate and increment entry count
                    yCoordinate = currentY - 10; // Prepare y-coordinate for the next entry
                    entriesPerPage++; // Increment the count of entries on the current page
                });
            }

            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    // Get Attendance Data By Session and Province
    getAttendanceBySessionProvince: async (sessionId, province) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };



            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            // Fetch members in the given province
            const membersInProvince = await Members.findAll({
                where: { memberProvince: province }
            });

            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })
            // Iterate over sitting days
            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }

                // Iterate over members in the province
                for (const member of membersInProvince) {
                    // Check for an attendance record for the member on the sitting day
                    const attendanceRecord = await SessionAttendance.findOne({
                        where: {
                            fkManageSessionId: sittingDay.id,
                            fkMemberId: member.id,
                        },
                        attributes: ['attendanceStatus'],
                    });

                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                    // Initialize province structure if it doesn't exist
                    if (!attendanceByDate[date][province]) {
                        attendanceByDate[date][province] = [];
                    }

                    // Add member attendance data
                    attendanceByDate[date][province].push({
                        memberId: member.id,
                        memberName: member.memberName,
                        attendanceStatus: attendanceStatus,

                    });

                    // Update overall stats
                    overallStats[attendanceStatus]++;
                    overallStats.Total++;
                }
            }

            return {
                province: province,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSesionProvince: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senators of Province: ${attendance.province} during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 110, y: yCoordinate - 110, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'province' && dateKey !== 'overallStats') {
                    //console.log("Date Kay", dateKey)
                    for (const provinceName in attendance[dateKey]) {
                        // for (const partyName in attendance[dateKey][provinceName]) {
                        entries.push({ dateKey, provinceName, data: attendance[dateKey][provinceName] });
                        // }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { provinceName } = entries[0];
                //  console.log("provinceName",provinceName)
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                //  page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;
                // console.log("entries",entries[0])

                entries.forEach((entry, index) => {
                    // if (index %1 === 0 && index !== 0) { // New page after every 3 entries
                    // page = pdfDoc.addPage();
                    // yCoordinate = page.getHeight() - 50;

                    //     // page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                    //     // page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate , ...boldTextOptions });

                    //     yCoordinate -= 20;
                    // }

                    const { dateKey, data } = entry;
                    //console.log("Data",data)
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });
                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });

                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    const dataArray = Array.isArray(data) ? data : [data];
                    // console.log("data array obj",dataArray)
                    // console.log("Data",data)
                    // console.log("data array",[data])
                    dataArray.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight;
                    });

                    //  yCoordinate = currentY - 10;
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                });
            }

            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    // Get Attendance Data By Session and Party
    getAttendanceBySessionParty: async (sessionId, partyId) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch party short name
            const party = await PoliticalParties.findOne({
                where: { id: partyId },
                attributes: ['id', 'partyName', 'shortName'],
            });
            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })



            // Fetch the member based on memberName
            // const member = await Members.findAll({
            //     where: { politicalParty: partyId, memberProvince: province },
            //     attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            // });

            const membersInProvince = await Members.findAll({
                where: { politicalParty: partyId }
            });


            const partyName = party.partyName
            //const provinceName = member.memberProvince;

            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][partyName]) {
                    attendanceByDate[date][partyName] = [];
                }


                // Check for an attendance record for the member on the sitting day
                for (const member of membersInProvince) {
                    // Check for an attendance record for the member on the sitting day
                    const attendanceRecord = await SessionAttendance.findOne({
                        where: {
                            fkManageSessionId: sittingDay.id,
                            fkMemberId: member.id,
                        },
                        attributes: ['attendanceStatus'],
                    });

                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                    // Initialize province structure if it doesn't exist
                    if (!attendanceByDate[date][partyName]) {
                        attendanceByDate[date][partyName] = [];
                    }

                    // Add member attendance data
                    attendanceByDate[date][partyName].push({
                        memberId: member.id,
                        memberName: member.memberName,
                        attendanceStatus: attendanceStatus,

                    });

                    // Update overall stats
                    overallStats[attendanceStatus]++;
                    overallStats.Total++;
                }
            }

            // Check if attendanceByDate is still empty, which means no attendance records were found
            if (Object.keys(attendanceByDate).length === 0) {
                return { message: "No Data Found" };
            }

            return {
                party: partyName,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },


    generatedPDFForSesionParty: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senators of Party: ${attendance.party} during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 110, y: yCoordinate - 110, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'party' && dateKey !== 'overallStats') {
                    //console.log("Date Kay", dateKey)
                    for (const partyName in attendance[dateKey]) {
                        // for (const partyName in attendance[dateKey][provinceName]) {
                        entries.push({ dateKey, partyName, data: attendance[dateKey][partyName] });
                        // }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { partyName } = entries[0];
                //  console.log("provinceName",provinceName)
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                page.drawText(`Party Name: ${partyName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                //  page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;
                // console.log("entries",entries[0])

                entries.forEach((entry, index) => {
                    // if (index %1 === 0 && index !== 0) { // New page after every 3 entries
                    // page = pdfDoc.addPage();
                    // yCoordinate = page.getHeight() - 50;

                    //     // page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                    //     // page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate , ...boldTextOptions });

                    //     yCoordinate -= 20;
                    // }

                    const { dateKey, data } = entry;
                    //console.log("Data",data)
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });
                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });

                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    const dataArray = Array.isArray(data) ? data : [data];
                    // console.log("data array obj",dataArray)
                    // console.log("Data",data)
                    // console.log("data array",[data])
                    dataArray.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight;
                    });

                    //  yCoordinate = currentY - 10;
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                });
            }

            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    // Get Attendance Data By Session and Party and Member
    getAttendanceBySessionMemberParty: async (sessionId, partyId, memberName) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch party short name
            const party = await PoliticalParties.findOne({
                where: { id: partyId },
                attributes: ['id', 'partyName', 'shortName'],
            });

            // Fetch the member based on memberName
            const member = await Members.findOne({
                where: { id: memberName, politicalParty: partyId },
                attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            });

            if (!member) {
                throw new Error({ message: "Member not found" });
            }

            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })

            const partyname = party.partyName;
            const provinceName = member.memberProvince;

            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][partyname]) {
                    attendanceByDate[date][partyname] = [];
                }

                // Check for an attendance record for the member on the sitting day
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: sittingDay.id,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });

                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                // Add member attendance data
                attendanceByDate[date][partyname].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });

                // Update overall stats
                overallStats[attendanceStatus]++;
                overallStats.Total++;
            }

            return {
                member: member.memberName,
                party: partyname,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSessionMemberParty: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senator ${attendance.member} of Party ${attendance.party}`, { x: 50, y: yCoordinate - 110, ...boldTextOptions });
            page.drawText(`during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 50, y: yCoordinate - 130, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'party' && dateKey !== 'member') {
                    //for (const provinceName in attendance[dateKey]) {
                    for (const partyName in attendance[dateKey]) {
                        entries.push({ dateKey, partyName, data: attendance[dateKey][partyName] });
                    }
                    //}
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { partyName } = entries[0];
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                // page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;

                let entriesPerPage = 0; // Track number of entries added to the current page
                // let page = pdfDoc.addPage(); // Initialize the first page
                // let yCoordinate = page.getHeight() - 50; // Start at the top of the first page

                entries.forEach((entry, index) => {
                    const { dateKey, data } = entry;

                    // Check if date is valid and data is present
                    if (!moment(dateKey).isValid() || !Array.isArray(data) || data.length === 0) {
                        //  console.log(`Skipping entry with invalid date or no data: ${dateKey}`);
                        return; // Skip this iteration if date is invalid or data is empty
                    }

                    // Decide if a new page is needed
                    if (entriesPerPage >= 4) { // If the current page is full
                        page = pdfDoc.addPage(); // Start a new page
                        yCoordinate = page.getHeight() - 50; // Reset y-coordinate to the top of the new page
                        entriesPerPage = 0; // Reset the entries per page counter
                    }

                    // Draw the date and reset layout coordinates
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });

                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;

                    // Draw headers for the first entry or new page
                    //if (entriesPerPage === 0) { // Only draw headers on the first entry of each page
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    //}

                    // Draw member details
                    data.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight; // Move down for the next row
                    });

                    // Update y-coordinate and increment entry count
                    yCoordinate = currentY - 10; // Prepare y-coordinate for the next entry
                    entriesPerPage++; // Increment the count of entries on the current page
                });
            }

            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    getAttendanceBySessionMemberProvince: async (sessionId, province, memberName) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch party short name
            //   const party = await PoliticalParties.findOne({
            //     where: { id: partyId },
            //     attributes: ['id', 'partyName', 'shortName'],
            // });

            // Fetch the member based on memberName
            const member = await Members.findOne({
                where: { id: memberName, memberProvince: province },
                attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            });

            if (!member) {
                throw new Error({ message: "Member not found" });
            }


            const provinceName = member.memberProvince;
            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })
            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][provinceName]) {
                    attendanceByDate[date][provinceName] = [];
                }

                // Check for an attendance record for the member on the sitting day
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: sittingDay.id,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });

                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                // Add member attendance data
                attendanceByDate[date][provinceName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });

                // Update overall stats
                overallStats[attendanceStatus]++;
                overallStats.Total++;
            }

            return {
                member: member.memberName,
                province: provinceName,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSessionMemberProvince: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senator ${attendance.member} of Province ${attendance.province}`, { x: 50, y: yCoordinate - 110, ...boldTextOptions });
            page.drawText(`during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 50, y: yCoordinate - 130, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'member' && dateKey !== 'province' && dateKey !== 'overallStats') {
                    //console.log("Date Kay", dateKey)
                    for (const provinceName in attendance[dateKey]) {
                        // for (const partyName in attendance[dateKey][provinceName]) {
                        entries.push({ dateKey, provinceName, data: attendance[dateKey][provinceName] });
                        // }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { provinceName } = entries[0];
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                // page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;

                let entriesPerPage = 0; // Track number of entries added to the current page
                // let page = pdfDoc.addPage(); // Initialize the first page
                // let yCoordinate = page.getHeight() - 50; // Start at the top of the first page

                entries.forEach((entry, index) => {
                    const { dateKey, data } = entry;

                    // Check if date is valid and data is present
                    if (!moment(dateKey).isValid() || !Array.isArray(data) || data.length === 0) {
                        //  console.log(`Skipping entry with invalid date or no data: ${dateKey}`);
                        return; // Skip this iteration if date is invalid or data is empty
                    }

                    // Decide if a new page is needed
                    if (entriesPerPage >= 4) { // If the current page is full
                        page = pdfDoc.addPage(); // Start a new page
                        yCoordinate = page.getHeight() - 50; // Reset y-coordinate to the top of the new page
                        entriesPerPage = 0; // Reset the entries per page counter
                    }

                    // Draw the date and reset layout coordinates
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });

                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;

                    // Draw headers for the first entry or new page
                    //if (entriesPerPage === 0) { // Only draw headers on the first entry of each page
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    //}

                    // Draw member details
                    data.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight; // Move down for the next row
                    });

                    // Update y-coordinate and increment entry count
                    yCoordinate = currentY - 10; // Prepare y-coordinate for the next entry
                    entriesPerPage++; // Increment the count of entries on the current page
                });
            }
            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    // get Attendance Data By Session, Party and Province
    getAttendanceBySessionPartyProvince: async (sessionId, province, partyId) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch party short name
            const party = await PoliticalParties.findOne({
                where: { id: partyId },
                attributes: ['id', 'partyName', 'shortName'],
            });
            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })



            // Fetch the member based on memberName
            // const member = await Members.findAll({
            //     where: { politicalParty: partyId, memberProvince: province },
            //     attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            // });

            const membersInProvince = await Members.findAll({
                where: {
                    memberProvince: province,
                    politicalParty: partyId
                }
            });


            const partyName = party.partyName
            //const provinceName = member.memberProvince;

            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][province]) {
                    attendanceByDate[date][province] = {};
                }
                if (!attendanceByDate[date][province][partyName]) {
                    attendanceByDate[date][province][partyName] = [];
                }


                // Check for an attendance record for the member on the sitting day
                for (const member of membersInProvince) {
                    // Check for an attendance record for the member on the sitting day
                    const attendanceRecord = await SessionAttendance.findOne({
                        where: {
                            fkManageSessionId: sittingDay.id,
                            fkMemberId: member.id,
                        },
                        attributes: ['attendanceStatus'],
                    });

                    const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                    // Initialize province structure if it doesn't exist
                    if (!attendanceByDate[date][province][partyName]) {
                        attendanceByDate[date][province][partyName] = [];
                    }

                    // Add member attendance data
                    attendanceByDate[date][province][partyName].push({
                        memberId: member.id,
                        memberName: member.memberName,
                        attendanceStatus: attendanceStatus,

                    });

                    // Update overall stats
                    overallStats[attendanceStatus]++;
                    overallStats.Total++;
                }
            }

            // Check if attendanceByDate is still empty, which means no attendance records were found
            if (Object.keys(attendanceByDate).length === 0) {
                return { message: "No Data Found" };
            }

            return {
                province: province,
                party: partyName,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSessionPartyProvince: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senators of Party: ${attendance.party} and Province: ${attendance.province}`, { x: 50, y: yCoordinate - 110, ...boldTextOptions });
            page.drawText(`during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 50, y: yCoordinate - 120, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'party' && dateKey !== 'province') {
                    //console.log("Date Kay", dateKey)
                    for (const provinceName in attendance[dateKey]) {
                        for (const partyName in attendance[dateKey][provinceName]) {
                            entries.push({ dateKey, provinceName, partyName, data: attendance[dateKey][provinceName][partyName] });
                        }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { provinceName, partyName } = entries[0];
                //  console.log("provinceName",provinceName)
                page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                page.drawText(`Party Name: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                //  page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });

                yCoordinate -= 20;
                // console.log("entries",entries[0])

                entries.forEach((entry, index) => {
                    // if (index %1 === 0 && index !== 0) { // New page after every 3 entries
                    // page = pdfDoc.addPage();
                    // yCoordinate = page.getHeight() - 50;

                    //     // page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                    //     // page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate , ...boldTextOptions });

                    //     yCoordinate -= 20;
                    // }

                    const { dateKey, data } = entry;
                    //console.log("Data",data)
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });
                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });

                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    const dataArray = Array.isArray(data) ? data : [data];
                    // console.log("data array obj",dataArray)
                    // console.log("Data",data)
                    // console.log("data array",[data])
                    dataArray.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight;
                    });

                    //  yCoordinate = currentY - 10;
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                });
            }

            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    },

    getAttendanceBySessionMemberPartyProvince: async (sessionId, province, partyId, memberName) => {
        try {
            const attendanceByDate = {};
            const overallStats = {
                Present: 0,
                Leave: 0,
                Suspended: 0,
                Absent: 0,
                Vacant: 0,
                Total: 0,
            };

            // Fetch party short name
            const party = await PoliticalParties.findOne({
                where: { id: partyId },
                attributes: ['id', 'partyName', 'shortName'],
            });

            // Fetch the member based on memberName
            const member = await Members.findOne({
                where: { id: memberName, memberProvince: province, politicalParty: partyId },
                attributes: ['id', 'memberName', 'memberProvince', 'politicalParty'],
            });

            if (!member) {
                throw new Error({ message: "Member not found" });
            }

            const partyName = party.partyName;
            console.log(partyName)
            const sessionDetails = await Sessions.findOne({
                where: { id: sessionId },
                attributes: ['id', 'sessionName', 'startDate', 'isQuoraumAdjourned']
            })
            // Fetch sitting days for the session
            const sittingDays = await ManageSessions.findAll({
                where: { fkSessionId: sessionId },
                order: [['sittingDate', 'ASC']]
            });

            for (const sittingDay of sittingDays) {
                const date = sittingDay.sittingDate; // Format date as YYYY-MM-DD

                // Initialize date structure if it doesn't exist
                // Initialize nested structure for date, province, and party if they don't exist
                if (!attendanceByDate[date]) {
                    attendanceByDate[date] = {};
                }
                if (!attendanceByDate[date][province]) {
                    attendanceByDate[date][province] = {};
                }
                if (!attendanceByDate[date][province][partyName]) {
                    attendanceByDate[date][province][partyName] = [];
                }

                // Check for an attendance record for the member on the sitting day
                const attendanceRecord = await SessionAttendance.findOne({
                    where: {
                        fkManageSessionId: sittingDay.id,
                        fkMemberId: member.id,
                    },
                    attributes: ['attendanceStatus'],
                });

                const attendanceStatus = attendanceRecord ? attendanceRecord.attendanceStatus : 'Present';

                // Add member attendance data
                attendanceByDate[date][province][partyName].push({
                    memberId: member.id,
                    memberName: member.memberName,
                    attendanceStatus: attendanceStatus,
                });

                // Update overall stats
                overallStats[attendanceStatus]++;
                overallStats.Total++;
            }

            return {
                member: member.memberName,
                province: province,
                party: partyName,
                sessionDetails,
                ...attendanceByDate,
                overallStats,
            };
        } catch (error) {
            throw new Error(error.message || "Error Retrieving Attendance Data.");
        }
    },

    generatedPDFForSessionMemberPartyProvince: async (attendance) => {
        try {
            const pdfDoc = await PDFDocument.create();
            const font = await pdfDoc.embedFont(StandardFonts.TimesRoman);
            const fontBold = await pdfDoc.embedFont(StandardFonts.TimesRomanBold);

            let page = pdfDoc.addPage();
            let yCoordinate = page.getHeight() - 50;
            const textOptions = { font, color: rgb(0, 0, 0), size: 10 };
            const boldTextOptions = { ...textOptions, font: fontBold };

            // Initial Session Information
            const verticalGap = 10;
            page.drawText('SENATE OF PAKISTAN', { x: 220, y: yCoordinate + verticalGap + 20, ...boldTextOptions });
            page.drawText('Notice-Office', { x: 250, y: yCoordinate + verticalGap, ...boldTextOptions });
            page.drawText('SESSION:', { x: 410, y: yCoordinate - 30, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.sessionName}`, { x: 490, y: yCoordinate - 30, ...textOptions });
            page.drawText('Commenced at:', { x: 410, y: yCoordinate - 50, ...boldTextOptions });
            page.drawText(`${moment(attendance.sessionDetails.startDate).format("DD-MM-YYYY")}`, { x: 490, y: yCoordinate - 50, ...textOptions });
            page.drawText('Adjourned:', { x: 410, y: yCoordinate - 70, ...boldTextOptions });
            page.drawText(`${attendance.sessionDetails.isQuoraumAdjourned}`, { x: 490, y: yCoordinate - 70, ...textOptions });
            page.drawText(`Session Attendance of Senator ${attendance.member} of Province ${attendance.province}`, { x: 50, y: yCoordinate - 100, ...boldTextOptions });
            page.drawText(`and Party ${attendance.party} during the Senate Session ${attendance.sessionDetails.sessionName}`, { x: 50, y: yCoordinate - 115, ...boldTextOptions });

            yCoordinate -= 150; // Adjust initial yCoordinate

            let entriesCount = 0; // To track the number of entries on a page

            // Collect all entries first to group them by province and party
            const entries = [];
            for (const dateKey in attendance) {
                if (attendance.hasOwnProperty(dateKey) && dateKey !== 'sessionDetails' && dateKey !== 'member' && dateKey !== 'province' && dateKey !== 'party' && dateKey !== 'overallStats') {
                    //console.log("Date Kay", dateKey)
                    for (const provinceName in attendance[dateKey]) {
                        for (const partyName in attendance[dateKey][provinceName]) {
                            entries.push({ dateKey, provinceName, partyName, data: attendance[dateKey][provinceName][partyName] });
                        }
                    }
                }
            }

            // Assume one province and party for now as per your need
            if (entries.length > 0) {
                const { provinceName, partyName } = entries[0];
                // page.drawText(`Province: ${provinceName}, Party: ${partyName}`, { x: 50, y: yCoordinate, ...boldTextOptions });
                page.drawText(`Party: ${partyName}`, { x: 50, y: yCoordinate + 15, ...boldTextOptions });
                page.drawText(`Province: ${provinceName}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });

                yCoordinate -= 20;

                let entriesPerPage = 0; // Track number of entries added to the current page
                // let page = pdfDoc.addPage(); // Initialize the first page
                // let yCoordinate = page.getHeight() - 50; // Start at the top of the first page

                entries.forEach((entry, index) => {
                    const { dateKey, data } = entry;

                    // Check if date is valid and data is present
                    if (!moment(dateKey).isValid() || !Array.isArray(data) || data.length === 0) {
                        //  console.log(`Skipping entry with invalid date or no data: ${dateKey}`);
                        return; // Skip this iteration if date is invalid or data is empty
                    }

                    // Decide if a new page is needed
                    if (entriesPerPage >= 4) { // If the current page is full
                        page = pdfDoc.addPage(); // Start a new page
                        yCoordinate = page.getHeight() - 50; // Reset y-coordinate to the top of the new page
                        entriesPerPage = 0; // Reset the entries per page counter
                    }

                    // Draw the date and reset layout coordinates
                    page.drawText(`Sitting Date: ${moment(dateKey).format("DD-MM-YYYY")}`, { x: 50, y: yCoordinate + 5, ...boldTextOptions });

                    const startX = 50;
                    const startY = yCoordinate - 20;
                    const columnWidth = 200;
                    const rowHeight = 20;
                    let currentY = startY - rowHeight;

                    // Draw headers for the first entry or new page
                    //if (entriesPerPage === 0) { // Only draw headers on the first entry of each page
                    page.drawRectangle({
                        x: startX,
                        y: startY,
                        width: columnWidth * 2,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText('Member Name', { x: startX + 5, y: startY + 5, ...boldTextOptions });
                    page.drawText('Attendance Status', { x: startX + columnWidth + 5, y: startY + 5, ...boldTextOptions });
                    //}

                    // Draw member details
                    data.forEach((member, idx) => {
                        page.drawRectangle({
                            x: startX,
                            y: currentY,
                            width: columnWidth * 2,
                            height: rowHeight,
                            borderColor: rgb(0, 0, 0),
                            borderWidth: 1
                        });
                        page.drawText(`${member.memberName}`, { x: startX + 5, y: currentY + 5, ...textOptions });
                        page.drawText(`${member.attendanceStatus}`, { x: startX + columnWidth + 5, y: currentY + 5, ...textOptions });
                        currentY -= rowHeight; // Move down for the next row
                    });

                    // Update y-coordinate and increment entry count
                    yCoordinate = currentY - 10; // Prepare y-coordinate for the next entry
                    entriesPerPage++; // Increment the count of entries on the current page
                });
            }
            // Adding the Overall Stats Table at the end
            if (attendance.hasOwnProperty('overallStats')) {
                if (yCoordinate < 100) { // Check space and possibly add a new page
                    page = pdfDoc.addPage();
                    yCoordinate = page.getHeight() - 50;
                }
                const stats = attendance.overallStats;
                page.drawText('Overall Attendance Stats', { x: 400, y: yCoordinate - 10, ...boldTextOptions });

                const startX = 50;
                const startY = yCoordinate - 40;
                const columnWidth = 150;
                const rowHeight = 20;
                let currentY = startY;

                Object.entries(stats).forEach(([key, value], index) => {
                    page.drawRectangle({
                        x: startX + 330,
                        y: currentY,
                        width: columnWidth,
                        height: rowHeight,
                        borderColor: rgb(0, 0, 0),
                        borderWidth: 1
                    });
                    page.drawText(`${key}`, { x: startX + 350, y: currentY + 5, ...textOptions });
                    page.drawText(`${value}`, { x: startX + 450, y: currentY + 5, ...textOptions });
                    currentY -= rowHeight;
                });
            }

            const pdfBytes = await pdfDoc.save();
            return pdfBytes;
        } catch (error) {
            console.error('Error generating PDF:', error);
            throw error;
        }
    }
}

module.exports = manageSessionsService