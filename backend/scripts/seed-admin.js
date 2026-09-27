const path = require("path");
const crypto = require("crypto");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const bcrypt = require("bcrypt");
const { supabase } = require("../src/config/supabase");

const CORREO = "admin@refaccionaria.com";

async function main() {
  const { data: existente, error: buscarError } = await supabase
    .from("usuarios")
    .select("id, rol")
    .eq("correo", CORREO)
    .maybeSingle();

  if (buscarError) throw buscarError;
  if (existente) {
    if (existente.rol !== "admin") {
      const { error } = await supabase.from("usuarios").update({ rol: "admin" }).eq("id", existente.id);
      if (error) throw error;
    }
    console.log("El admin ya existe. No se cambió la contraseña.");
    console.log("Correo:", CORREO);
    return;
  }

  const password = crypto.randomBytes(9).toString("base64url");
  const hash = await bcrypt.hash(password, 10);
  const { error } = await supabase.from("usuarios").insert({
    nombre: "Admin",
    apellido: "Refaccionaria",
    correo: CORREO,
    password: hash,
    rol: "admin",
  });
  if (error) throw error;

  console.log("Admin creado.");
  console.log("Correo:", CORREO);
  console.log("Contraseña temporal:", password);
}

main().catch((err) => {
  console.error(err.message || err);
  process.exit(1);
});
