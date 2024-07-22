// controllers/newRotaList.controller.js
const rotaService = require('../services/newRotaList.service');
const rotaListService = require("../services/rotaList.service")
const path = require('path');
const fs = require('fs');

class newRotaController {
    async createRota(req, res) {
        try {
            const { newRota, sessionDetails, dates } = await rotaService.createRota(req.body);
            
            // Create the rotaList object to pass to createRotaListPDF
            const rotaList = { sessionDetails, dates };
    
            // Generate the PDF
            const rotaOutput = await rotaListService.createRotaListPDF(rotaList, req.body);
            const buffer = Buffer.from(rotaOutput);
            const fileName = `rota_${Date.now()}.pdf`;
            const pdfDirectory = path.join(__dirname, '..', 'pdfDownload');
    
            if (!fs.existsSync(pdfDirectory)) {
                fs.mkdirSync(pdfDirectory, { recursive: true });
            }
    
            const filePath = path.join(pdfDirectory, fileName);
            fs.writeFileSync(filePath, buffer);
    
            // Provide a link to download the PDF
            const fileLink = `/assets/${fileName}`;
    
            // Update the rota entry with the PDF link
            newRota.pdfLink = fileLink;
            await newRota.save();
    
            res.status(201).json({
                success: true,
                message: 'Rota created successfully!',
                data: { rota: newRota, fileLink },
            });
        } catch (error) {
            res.status(500).json({ message: 'Failed to create rota', error: error.message });
        }
    }

    async getAllRota(req, res) {
        try {
            const currentPage = parseInt(req.query.currentPage) || 0;
            const pageSize = parseInt(req.query.pageSize) || 10;
    
            const { count, totalPages, rotas } = await rotaService.getAllRota(currentPage, pageSize);
    
            if (rotas.length === 0) {
                return res.status(200).send({
                    success: true,
                    message: 'No data found on this page!',
                    data: [],
                    totalPages,
                    count
                });
            }
    
            return res.status(200).send({
                success: true,
                message: "Rotas fetched successfully!",
                data: rotas,
                totalPages,
                count
            });
    
        } catch (error) {
            return res.status(400).send({
                success: false,
                message: error.message
            });
        }
    }

    async getRotaById(req, res) {
        try {
            const rota = await rotaService.getRotaById(req.params.id);
            if (rota) {
                res.status(200).json({ message: 'Rota retrieved successfully', data: rota });
            } else {
                res.status(404).json({ message: 'Rota not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to retrieve rota', error: error.message });
        }
    }

    async updateRota(req, res) {
        try {
            const rota = await rotaService.updateRota(req.params.id, req.body);
            if (rota) {
                res.status(200).json({ message: 'Rota updated successfully', data: rota });
            } else {
                res.status(404).json({ message: 'Rota not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to update rota', error: error.message });
        }
    }

    async deleteRota(req, res) {
        try {
            const success = await rotaService.deleteRota(req.params.id);
            if (success) {
                res.status(204).json({ message: 'Rota deleted successfully' });
            } else {
                res.status(404).json({ message: 'Rota not found' });
            }
        } catch (error) {
            res.status(500).json({ message: 'Failed to delete rota', error: error.message });
        }
    }
}

module.exports = new newRotaController();