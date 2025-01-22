const legisOrderOfDayService = require("../services/legisOrderOfDay.service");

exports.create = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.create(req.body);
        res.status(201).send({
            success: true,
            message: "Order of Day created successfully",
            data: data
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error occurred while creating Order of Day"
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findAll();
        res.send({
            success: true,
            message: "Orders of Day retrieved successfully",
            data: data
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error occurred while retrieving Orders of Day"
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findOne(req.params.id);
        if (!data) {
            return res.status(404).send({
                success: false,
                message: `Order of Day not found with id ${req.params.id}`
            });
        }
        res.send({
            success: true,
            message: "Order of Day retrieved successfully",
            data: data
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error retrieving Order of Day"
        });
    }
};

exports.findBySession = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findBySession(req.params.sessionId);
        res.send({
            success: true,
            message: "Session Orders of Day retrieved successfully",
            data: data
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error retrieving Orders of Day for session"
        });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await legisOrderOfDayService.update(req.params.id, req.body);
        if (updated[0] === 0) {
            return res.status(404).send({
                success: false,
                message: `Cannot update Order of Day with id ${req.params.id}. Maybe it was not found!`
            });
        }
        res.send({
            success: true,
            message: "Order of Day updated successfully"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error updating Order of Day"
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await legisOrderOfDayService.delete(req.params.id);
        if (!deleted) {
            return res.status(404).send({
                success: false,
                message: `Cannot delete Order of Day with id ${req.params.id}. Maybe it was not found!`
            });
        }
        res.send({
            success: true,
            message: "Order of Day deleted successfully"
        });
    } catch (err) {
        res.status(500).send({
            success: false,
            message: err.message || "Error deleting Order of Day"
        });
    }
};
