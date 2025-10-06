// backend/routes/riegoRoutes.js
const express = require("express");
const { programarRiego, getHistorialRiego } = require("../controllers/regarController");

const router = express.Router();

// Ruta POST para programar un riego
router.post("/programar", programarRiego);

// Historial de riegos (programados/ejecutados) con filtros opcionales
router.get("/historial", getHistorialRiego);

module.exports = router;
