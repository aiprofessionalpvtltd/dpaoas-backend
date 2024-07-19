// routes/rotaRoutes.js
const express = require('express');
const newRotaController = require('../controllers/newRotaList.controller');

const router = express.Router();

router.post('/create', newRotaController.createRota);
router.get('/getAll', newRotaController.getAllRota);
router.get('/getById/:id', newRotaController.getRotaById);
router.put('/update/:id', newRotaController.updateRota);
router.delete('/delete/:id', newRotaController.deleteRota);

module.exports = router;