// backend/routes/riegoRoutes.js
const express = require("express");
const { programarRiego } = require("../controllers/regarController");

const router = express.Router();

// Ruta POST para programar un riego
router.post("/programar", programarRiego);

module.exports = router;
