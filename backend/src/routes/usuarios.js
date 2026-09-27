const express = require("express");
const bcrypt = require("bcrypt");
const { supabase } = require("../config/supabase");
const {
  USUARIO_PUBLICO,
  missing,
  isEmail,
  mapAuto,
  handleSupabaseError,
} = require("../utils");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();
const SALT_ROUNDS = 10;

async function crearUsuario(req, res) {
  const campos = missing(req.body, ["nombre", "apellido", "correo", "password"]);
  if (campos.length) {
    return res.status(400).json({ error: `Faltan campos: ${campos.join(", ")}` });
  }
  if (!isEmail(req.body.correo)) {
    return res.status(400).json({ error: "Correo inválido." });
  }

  const hash = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  const { data, error } = await supabase
    .from("usuarios")
    .insert({
      nombre: req.body.nombre.trim(),
      apellido: req.body.apellido.trim(),
      correo: req.body.correo.trim().toLowerCase(),
      password: hash,
      telefono: req.body.telefono ?? null,
      rol: "usuario",
    })
    .select(USUARIO_PUBLICO)
    .single();

  if (handleSupabaseError(res, error)) return;
  return res.status(201).json(data);
}

router.post("/", requireAdmin, crearUsuario);

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(USUARIO_PUBLICO)
    .order("created_at", { ascending: false });

  if (handleSupabaseError(res, error)) return;
  return res.json(data);
});

router.get("/:id/autos", async (req, res) => {
  const { data: usuario, error: usuarioError } = await supabase
    .from("usuarios")
    .select("id")
    .eq("id", req.params.id)
    .maybeSingle();

  if (handleSupabaseError(res, usuarioError)) return;
  if (!usuario) return res.status(404).json({ error: "Usuario no encontrado." });

  const { data, error } = await supabase
    .from("autos")
    .select("*")
    .eq("usuario_id", req.params.id)
    .order("created_at", { ascending: false });

  if (handleSupabaseError(res, error)) return;
  return res.json(data.map(mapAuto));
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .select(USUARIO_PUBLICO)
    .eq("id", req.params.id)
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Usuario no encontrado." });
  return res.json(data);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const payload = {};
  for (const key of ["nombre", "apellido", "correo", "telefono", "rol"]) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (payload.correo) {
    if (!isEmail(payload.correo)) {
      return res.status(400).json({ error: "Correo inválido." });
    }
    payload.correo = payload.correo.trim().toLowerCase();
  }
  if (req.body.password) {
    payload.password = await bcrypt.hash(req.body.password, SALT_ROUNDS);
  }
  if (!Object.keys(payload).length) {
    return res.status(400).json({ error: "No hay campos para actualizar." });
  }

  const { data, error } = await supabase
    .from("usuarios")
    .update(payload)
    .eq("id", req.params.id)
    .select(USUARIO_PUBLICO)
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Usuario no encontrado." });
  return res.json(data);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("usuarios")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Usuario no encontrado." });
  return res.status(200).json({ message: "Usuario eliminado." });
});

module.exports = { router, crearUsuario };
