// backend/routes/userRoutes.js
const express = require("express");
const { getUsers, updateUser, deleteUser } = require("../controllers/userController");
const { requireAdmin } = require("../middleware/auth");

const router = express.Router();

// Todas estas rutas requieren privilegios de administrador
router.get("/", requireAdmin, getUsers);
router.put("/:id", requireAdmin, updateUser);
router.delete("/:id", requireAdmin, deleteUser);

module.exports = router;    