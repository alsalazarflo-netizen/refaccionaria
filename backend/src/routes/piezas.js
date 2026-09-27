const express = require("express");
const { supabase } = require("../config/supabase");
const { missing, handleSupabaseError } = require("../utils");
const { requireAdmin } = require("../middleware/requireAdmin");

const router = express.Router();

router.post("/", requireAdmin, async (req, res) => {
  const campos = missing(req.body, ["nombre", "precio", "codigo"]);
  if (campos.length) {
    return res.status(400).json({ error: `Faltan campos: ${campos.join(", ")}` });
  }

  const { data, error } = await supabase
    .from("piezas")
    .insert({
      nombre: req.body.nombre.trim(),
      descripcion: req.body.descripcion ?? null,
      marca: req.body.marca ?? null,
      categoria: req.body.categoria ?? null,
      precio: Number(req.body.precio),
      stock: req.body.stock == null ? 0 : Number(req.body.stock),
      codigo: String(req.body.codigo).trim(),
    })
    .select("*")
    .single();

  if (handleSupabaseError(res, error)) return;
  return res.status(201).json(data);
});

router.get("/", async (_req, res) => {
  const { data, error } = await supabase
    .from("piezas")
    .select("*")
    .order("created_at", { ascending: false });

  if (handleSupabaseError(res, error)) return;
  return res.json(data);
});

router.get("/:id", async (req, res) => {
  const { data, error } = await supabase
    .from("piezas")
    .select("*")
    .eq("id", req.params.id)
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Pieza no encontrada." });
  return res.json(data);
});

router.put("/:id", requireAdmin, async (req, res) => {
  const payload = {};
  for (const key of ["nombre", "descripcion", "marca", "categoria", "codigo"]) {
    if (req.body[key] !== undefined) payload[key] = req.body[key];
  }
  if (req.body.precio !== undefined) payload.precio = Number(req.body.precio);
  if (req.body.stock !== undefined) payload.stock = Number(req.body.stock);
  if (!Object.keys(payload).length) {
    return res.status(400).json({ error: "No hay campos para actualizar." });
  }

  const { data, error } = await supabase
    .from("piezas")
    .update(payload)
    .eq("id", req.params.id)
    .select("*")
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Pieza no encontrada." });
  return res.json(data);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  const { data, error } = await supabase
    .from("piezas")
    .delete()
    .eq("id", req.params.id)
    .select("id")
    .maybeSingle();

  if (handleSupabaseError(res, error)) return;
  if (!data) return res.status(404).json({ error: "Pieza no encontrada." });
  return res.status(200).json({ message: "Pieza eliminada." });
});

module.exports = router;
