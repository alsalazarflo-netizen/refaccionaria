const express = require("express");
const { supabase } = require("../config/supabase");
const { missing, mapAuto, autoPayload, handleSupabaseError } = require("../utils");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/", requireAdmin, async (req, res) => {
  const campos = missing(req.body, ["usuario_id", "marca", "modelo"]);
  if (campos.length) {
    return res.status(400).json({ error: `Faltan campos: ${campos.join(", ")}` });
  }

  const { data, error } = await supabase
    .from("autos")
    .insert(autoPayload(req.body))
    .select("*")
    .single();

  if (handleSupabaseError(res, error)) return;
  return res.status(201).json(mapAuto(data));
});

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("autos")
    .select("*")
    .order("created_at", { ascending: false });

  if (handleSupabaseError(res, error)) return;
  return res.json(data.map(mapAuto));
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("autos")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Auto no encontrado." });
  return res.json(mapAuto(data));
});

router.put("/:id", requireAdmin, async (req, res) => {
  const payload = {};
  if (req.body.usuario_id !== undefined) payload.usuario_id = req.body.usuario_id;
  if (req.body.marca !== undefined) payload.marca = req.body.marca;
  if (req.body.modelo !== undefined) payload.modelo = req.body.modelo;
  if (req.body.placa !== undefined) payload.placa = req.body.placa;
  if (req.body.anio !== undefined || req.body.año !== undefined) {
    const anio = req.body.anio ?? req.body.año;
    payload.anio = anio === "" || anio == null ? null : Number(anio);
  }
  if (!Object.keys(payload).length) {
    return res.status(400).json({ error: "No hay campos para actualizar." });
  }

  const { data, error } = await supabase
    .from("autos")
    .update(payload)
    .eq("id", req.params.id)
    .select("*")
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Auto no encontrado." });
  return res.json(mapAuto(data));
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("autos")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Auto no encontrado." });
  return res.status(200).json({ message: "Auto eliminado." });
});

module.exports = router;
