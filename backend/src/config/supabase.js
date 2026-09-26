const { createClient } = require("@supabase/supabase-js");

const url = process.env.SUPABASE_URL?.trim();
const key = process.env.SUPABASE_KEY?.trim();

if (!url || !key) {
  throw new Error("Faltan SUPABASE_URL o SUPABASE_KEY en .env");
}

const supabase = createClient(url, key);

module.exports = { supabase };
