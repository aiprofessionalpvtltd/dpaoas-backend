const legisOrderOfDayService = require("../services/legisOrderOfDay.service");

exports.create = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.create(req.body);
        res.status(201).json({
            status: "success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Some error occurred while creating the Order of Day."
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findAll();
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Some error occurred while retrieving Orders of Day."
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findOne(req.params.id);
        if (!data) {
            return res.status(404).json({
                status: "error",
                message: "Order of Day not found"
            });
        }
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error retrieving Order of Day"
        });
    }
};

exports.findBySession = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.findBySession(req.params.sessionId);
        res.status(200).json({
            status: "success",
            data: data
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error retrieving Orders of Day for session"
        });
    }
};

exports.update = async (req, res) => {
    try {
        const data = await legisOrderOfDayService.update(req.params.id, req.body);
        res.status(200).json({
            status: "success",
            message: "Order of Day updated successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error updating Order of Day"
        });
    }
};

exports.delete = async (req, res) => {
    try {
        await legisOrderOfDayService.delete(req.params.id);
        res.status(200).json({
            status: "success",
            message: "Order of Day deleted successfully"
        });
    } catch (error) {
        res.status(500).json({
            status: "error",
            message: error.message || "Error deleting Order of Day"
        });
    }
};
