const express = require("express");
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabase");
const { missing, isEmail, omitPassword, handleSupabaseError } = require("../utils");
const { crearUsuario } = require("./usuarios");
const { firmarSesion } = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/register", crearUsuario);

router.post("/login", async (req, res) => {
  try {
    const campos = missing(req.body, ["correo", "password"]);
    if (campos.length) {
      return res.status(400).json({ error: `Faltan campos: ${campos.join(", ")}` });
    }
    if (!isEmail(req.body.correo)) {
      return res.status(400).json({ error: "Correo inválido." });
    }

    const { data: usuario, error } = await supabase
      .from("usuarios")
      .select("*")
      .eq("correo", req.body.correo.trim().toLowerCase())
      .maybeSingle();

    if (handleSupabaseError(res, error)) return;
    if (!usuario) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    const ok = await bcrypt.compare(req.body.password, usuario.password);
    if (!ok) {
      return res.status(401).json({ error: "Correo o contraseña incorrectos." });
    }

    return res.json({ token: firmarSesion(usuario), usuario: omitPassword(usuario) });
  } catch (err) {
    console.error(err);
    return res.status(err.status || 500).json({ error: err.message || "Error interno del servidor." });
  }
});

module.exports = router;
