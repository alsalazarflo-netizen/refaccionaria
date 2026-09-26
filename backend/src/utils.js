const USUARIO_PUBLICO =
  "id, nombre, apellido, correo, telefono, rol, created_at";

function omitPassword(row) {
  if (!row) return row;
  const { password, ...rest } = row;
  return rest;
}

function missing(body, fields) {
  return fields.filter((f) => {
    const v = body[f];
    return v === undefined || v === null || String(v).trim() === "";
  });
}

function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(value).trim());
}

function mapAuto(row) {
  if (!row) return row;
  const { anio, ...rest } = row;
  return { ...rest, año: anio };
}

function autoPayload(body) {
  const anio = body.anio ?? body.año ?? null;
  return {
    usuario_id: body.usuario_id,
    marca: body.marca,
    modelo: body.modelo,
    anio: anio === "" || anio == null ? null : Number(anio),
    placa: body.placa ?? null,
  };
}

function handleSupabaseError(res, error, fallback = "Error en la base de datos") {
  if (!error) return false;
  const code = error.code;
  const causeCode = error.cause?.code;
  if (code === "23505") {
    res.status(409).json({ error: "El registro ya existe (valor duplicado)." });
    return true;
  }
  if (code === "23503") {
    res.status(400).json({ error: "La referencia no existe." });
    return true;
  }
  if (code === "22P02" || error.message?.includes("invalid input syntax")) {
    res.status(400).json({ error: "Identificador inválido." });
    return true;
  }
  if (causeCode === "ENOTFOUND" || error.message === "TypeError: fetch failed" || error.message === "fetch failed") {
    res.status(503).json({
      error:
        "No se pudo conectar a Supabase. Revisa SUPABASE_URL en backend/.env (cópiala otra vez desde el dashboard) y reinicia npm run dev.",
    });
    return true;
  }
  res.status(500).json({ error: error.message || fallback });
  return true;
}

module.exports = {
  USUARIO_PUBLICO,
  omitPassword,
  missing,
  isEmail,
  mapAuto,
  autoPayload,
  handleSupabaseError,
};
