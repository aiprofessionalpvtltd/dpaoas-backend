const db = require("../models");
const Sessions = db.sessions;
const PaliamentaryYears = db.parliamentaryYears
const Op = db.Sequelize.Op;
const logger = require('../common/winston');

const sessionsService = {

    // Create Session
    createSession: async (req) => {
        try {
            // Create the session and save it in the database
            const session = await Sessions.create(req);
            return session;
        } catch (error) {
            throw { message: error.message || "Error Creating Session!" };

        }
    },

    // Get All Sessions
    getAllSessions: async (currentPage, pageSize) => {
        try {
            const offset = currentPage * pageSize;
            const limit = pageSize;
            const { count, rows } = await Sessions.findAndCountAll({
                // where: { sessionStatus: 'active' },
                include: [
                    {
                        model: PaliamentaryYears,
                        attributes: ['id', 'parliamentaryTenure']
                    }

                ],
                offset,
                limit,
                order: [
                    ['id', 'DESC'],
                ]
            });
            const totalPages = Math.ceil(count / pageSize);
            // Map businessSessions IDs to session names
            const sessionsWithNames = await Promise.all(rows.map(async (session) => {
                let businessSessionsNames = [];

                if (session.businessSessions && session.businessSessions.length > 0) {
                    businessSessionsNames = await Promise.all(session.businessSessions.map(async (sessionId) => {
                        const sessionData = await Sessions.findByPk(sessionId);
                        return sessionData ? { id: sessionId, sessionName: sessionData.sessionName } : null;
                    }));
                }

                return {
                    ...session.toJSON(),
                    businessSessions: businessSessionsNames,
                };
            }));

            return { count, totalPages, sessions: sessionsWithNames };
        } catch (error) {
            throw new Error(error.message || "Error Fetching All Sessions");
        }
    },

    // Get Single Session
    getSingleSession: async (sessionId) => {
        try {
            const session = await Sessions.findOne({
                where: { id: sessionId },
                include: [
                    {
                        model: PaliamentaryYears,
                        attributes: ['id', 'parliamentaryTenure']
                    }
                ]
            });
            if (!session) {
                throw new Error("Session Not Found!");
            }

            // Map businessSessions IDs to session names
            let businessSessionsNames = [];
            if (session.businessSessions && session.businessSessions.length > 0) {
                businessSessionsNames = await Promise.all(
                    session.businessSessions.map(async (businessSessionId) => {
                        const sessionData = await Sessions.findByPk(businessSessionId);
                        return sessionData ? { id: businessSessionId, sessionName: sessionData.sessionName } : null;
                    })
                );
            }
            return {
                ...session.toJSON(),
                businessSessions: businessSessionsNames,
            };
        } catch (error) {
            throw new Error(error.message || "Error Fetching Session");
        }
    },

    // Update Sesion
    updateSession: async (req, sessionId) => {
        try {
            await Sessions.update(req.body, { where: { id: sessionId } });
            // Fetch the updated session after the update
            const updatedSession = await Sessions.findOne({ where: { id: sessionId } });
            return updatedSession;
        } catch (error) {
            throw { message: error.message || "Error Updating Session!" };
        }
    },

    // Delete Session
    deleteSession: async (sessionId) => {
        try {
            const updatedData =
            {
                sessionStatus: "inactive"
            }
            await Sessions.update(updatedData, { where: { id: sessionId } });
            // Fetch the updated session after the update
            const deletedSession = await Sessions.findOne({ where: { id: sessionId } });
            return deletedSession;
        } catch (error) {
            throw { message: error.message || "Error Deleting Session!" };
        }
    }

}

module.exports = sessionsService