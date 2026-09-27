const jwt = require("jsonwebtoken");

function requireAdmin(req, res, next) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  if (!token || !process.env.JWT_SECRET) {
    return res.status(401).json({ error: "No tienes permisos." });
  }
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    if (payload.rol !== "admin") {
      return res.status(403).json({ error: "No tienes permisos." });
    }
    req.usuario = payload;
    return next();
  } catch {
    return res.status(401).json({ error: "No tienes permisos." });
  }
}

function firmarSesion(usuario) {
  if (!process.env.JWT_SECRET) {
    const error = new Error("Falta JWT_SECRET en el servidor.");
    error.status = 500;
    throw error;
  }
  return jwt.sign(
    { id: usuario.id, correo: usuario.correo, rol: usuario.rol },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );
}

module.exports = { requireAdmin, firmarSesion };
