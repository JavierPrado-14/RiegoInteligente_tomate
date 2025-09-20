const jwt = require("jsonwebtoken");

const requireAdmin = (req, res, next) => {
  const token = req.header("Authorization")?.replace("Bearer ", "");
  
  if (!token) {
    return res.status(401).json({ message: "Acceso denegado. Token requerido." });
  }

  try {
    const decoded = jwt.verify(token, "secreta");
    if (decoded.rol !== 2) {
      return res.status(403).json({ message: "Acceso denegado. Se requieren privilegios de administrador." });
    }
    req.user = decoded;
    next();
  } catch (err) {
    res.status(400).json({ message: "Token inválido" });
  }
};

module.exports = { requireAdmin };