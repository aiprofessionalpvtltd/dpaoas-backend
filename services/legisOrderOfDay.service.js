const db = require("../models");
const LegisOrderOfDay = db.legisOrderOfDay;

exports.create = async (data) => {
    return await LegisOrderOfDay.create(data);
};

exports.findAll = async () => {
    return await LegisOrderOfDay.findAll({
        include: [{
            model: db.sessions,
            as: 'session'
        }]
    });
};

exports.findOne = async (id) => {
    return await LegisOrderOfDay.findByPk(id, {
        include: [{
            model: db.sessions,
            as: 'session'
        }]
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

exports.update = async (id, data) => {
    return await LegisOrderOfDay.update(data, {
        where: { id: id }
    });
};

exports.delete = async (id) => {
    return await LegisOrderOfDay.destroy({
        where: { id: id }
    });
};
