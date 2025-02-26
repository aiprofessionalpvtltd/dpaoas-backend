const legisOrderOfDayService = require("../services/legisOrderOfDay.service");

exports.create = async (req, res) => {
    try {
        const { sittingId, sittingTime, sittingDate, content, fkSessionId, isMonday } = req.body;

        if (!sittingId || !sittingDate || !sittingTime || !content || !fkSessionId) {
            return res.status(400).json({
                success: false,
                message: "All fields are required",
                data: null
            });
        }

        const order = await legisOrderOfDayService.create(req.body);
        return res.status(201).json({
            success: true,
            message: "Order created successfully",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.findAll = async (req, res) => {
    try {
        const orders = await legisOrderOfDayService.findAll();
        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.findOne = async (req, res) => {
    try {
        const order = await legisOrderOfDayService.findOne(req.params.id);
        if (!order) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order retrieved successfully",
            data: order
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.findBySession = async (req, res) => {
    try {
        const orders = await legisOrderOfDayService.findBySession(req.params.sessionId);
        return res.status(200).json({
            success: true,
            message: "Orders retrieved successfully",
            data: orders
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.update = async (req, res) => {
    try {
        const updated = await legisOrderOfDayService.update(req.params.id, req.body);
        if (updated[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or no changes made",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order updated successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.delete = async (req, res) => {
    try {
        const deleted = await legisOrderOfDayService.remove(req.params.id);
        if (!deleted) {
            return res.status(404).json({
                success: false,
                message: "Order not found",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order deleted successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.sendToTranslation = async (req, res) => {
    try {
        const updated = await legisOrderOfDayService.sendToTranslation(req.params.id);
        if (updated[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or no changes made",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated to Translation successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};

exports.sendToLegislation = async (req, res) => {
    try {
        const updated = await legisOrderOfDayService.sendToLegislation(req.params.id);
        if (updated[0] === 0) {
            return res.status(404).json({
                success: false,
                message: "Order not found or no changes made",
                data: null
            });
        }

        return res.status(200).json({
            success: true,
            message: "Order status updated to Legislation successfully"
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Server error",
            error: error.message
        });
    }
};