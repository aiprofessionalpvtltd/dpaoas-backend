const db = require("../models");
const LegisOrderOfDay = db.legisOrderOfDay;
const Session = db.sessions; // Include the session model for relation

exports.create = async (legisOrderOfDayData) => {
    return await LegisOrderOfDay.create({
        sittingId: legisOrderOfDayData.sittingId,
        sittingTime: legisOrderOfDayData.sittingTime,
        sittingDate: legisOrderOfDayData.sittingDate,
        content: legisOrderOfDayData.content,
        fkSessionId: legisOrderOfDayData.fkSessionId,
        isMonday: legisOrderOfDayData?.isMonday,
        actingSecretary: legisOrderOfDayData?.actingSecretary,
        type: legisOrderOfDayData?.type || "SimpleOrder"
    });
};

exports.findAll = async () => {
    return await LegisOrderOfDay.findAll({
        attributes: ["id", "sittingId", "sittingTime", "sittingDate", "content", "fkSessionId", "isMonday", "actingSecretary", "type"],
        include: [
            {
                model: Session,
                as: "session",
                attributes: ["id", "sessionName"] // Include only necessary session attributes
            }
        ]
    });
};

exports.findOne = async (id) => {
    return await LegisOrderOfDay.findOne({
        where: { id },
        attributes: ["id", "sittingId", "sittingTime", "sittingDate", "content", "fkSessionId", "isMonday", "actingSecretary", "type"],
        include: [
            {
                model: Session,
                as: "session",
                attributes: ["id", "sessionName"]
            }
        ]
    });
};

exports.findBySession = async (sessionId) => {
    return await LegisOrderOfDay.findAll({
        where: { fkSessionId: sessionId },
        attributes: ["id", "sittingId", "sittingTime", "sittingDate", "content", "fkSessionId", "isMonday", "actingSecretary", "type"],
        include: [
            {
                model: Session,
                as: "session",
                attributes: ["id", "name"]
            }
        ]
    });
};

exports.update = async (id, legisOrderOfDayData) => {
    return await LegisOrderOfDay.update(
        {
            sittingId: legisOrderOfDayData.sittingId,
            sittingTime: legisOrderOfDayData.sittingTime,
            sittingDate: legisOrderOfDayData.sittingDate,
            content: legisOrderOfDayData.content,
            fkSessionId: legisOrderOfDayData.fkSessionId,
            isMonday: legisOrderOfDayData?.isMonday,
            actingSecretary: legisOrderOfDayData?.actingSecretary,
            type: legisOrderOfDayData?.type || "SimpleOrder"
        },
        {
            where: { id }
        }
    );
};

exports.delete = async (id) => {
    return await LegisOrderOfDay.destroy({
        where: { id }
    });
};

exports.sendToTranslation = async (id) => {
    return await LegisOrderOfDay.update(
        { sentStatus: "toTranslation" },
        { where: { id } }
    );
};

exports.sendToLegislation = async (id) => {
    return await LegisOrderOfDay.update(
        { sentStatus: "inLegislation" },
        { where: { id } }
    );
};