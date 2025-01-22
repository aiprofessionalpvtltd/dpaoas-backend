const db = require("../models");
const LegisOrderOfDay = db.legisOrderOfDay;

exports.create = async (legisOrderOfDayData) => {
    return await LegisOrderOfDay.create({
        sittingId: legisOrderOfDayData.sittingId,
        sittingLabel: legisOrderOfDayData.sittingLabel,
        content: legisOrderOfDayData.content,
        fkSessionId: legisOrderOfDayData.fkSessionId
    });
};

exports.findAll = async () => {
    return await LegisOrderOfDay.findAll({
        attributes: ['id', 'sittingId', 'sittingLabel', 'content', 'fkSessionId'],
        include: ['session']
    });
};

exports.findOne = async (id) => {
    return await LegisOrderOfDay.findOne({
        where: { id },
        attributes: ['id', 'sittingId', 'sittingLabel', 'content', 'fkSessionId'],
        include: ['session']
    });
};

exports.findBySession = async (sessionId) => {
    return await LegisOrderOfDay.findAll({
        where: { fkSessionId: sessionId },
        include: [{
            model: db.sessions,
            as: 'session'
        }]
    });
};

exports.update = async (id, legisOrderOfDayData) => {
    return await LegisOrderOfDay.update({
        sittingId: legisOrderOfDayData.sittingId,
        sittingLabel: legisOrderOfDayData.sittingLabel,
        content: legisOrderOfDayData.content,
        fkSessionId: legisOrderOfDayData.fkSessionId
    }, {
        where: { id }
    });
};

exports.delete = async (id) => {
    return await LegisOrderOfDay.destroy({
        where: { id: id }
    });
};
