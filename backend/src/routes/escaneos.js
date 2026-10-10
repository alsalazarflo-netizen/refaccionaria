const express = require("express");
const { supabase } = require("../config/supabase");
const { missing, handleSupabaseError } = require("../utils");
const { requireAuth } = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/", requireAuth, async (req, res) => {
  const { data, error } = await supabase
    .from("escaneos")
    .select("id, client_id, codigo, lat, lng, created_at")
    .eq("usuario_id", req.usuario.id)
    .order("created_at", { ascending: false })
    .limit(50);

  if (handleSupabaseError(res, error)) return;
  return res.json(data);
});

router.post("/", requireAuth, async (req, res) => {
  const campos = missing(req.body, ["client_id", "codigo"]);
  if (campos.length) {
    return res.status(400).json({ error: `Faltan campos: ${campos.join(", ")}` });
  }

  const fila = {
    client_id: String(req.body.client_id).trim(),
    usuario_id: req.usuario.id,
    codigo: String(req.body.codigo).trim(),
    lat: req.body.lat == null ? null : Number(req.body.lat),
    lng: req.body.lng == null ? null : Number(req.body.lng),
    created_at: req.body.created_at || new Date().toISOString(),
  };

  const { data: ya, error: buscarError } = await supabase
    .from("escaneos")
    .select("id, client_id, codigo, lat, lng, created_at")
    .eq("client_id", fila.client_id)
    .maybeSingle();

  if (handleSupabaseError(res, buscarError)) return;
  if (ya) return res.json(ya);

  const { data, error } = await supabase
    .from("escaneos")
    .insert(fila)
    .select("id, client_id, codigo, lat, lng, created_at")
    .single();

  if (handleSupabaseError(res, error)) return;
  return res.status(201).json(data);
});

module.exports = router;
