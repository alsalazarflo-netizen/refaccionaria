const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "..", ".env") });

const express = require("express");
const cors = require("cors");
const { router: usuariosRouter } = require("./routes/usuarios");
const autosRouter = require("./routes/autos");
const piezasRouter = require("./routes/piezas");
const authRouter = require("./routes/auth");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get("/", (_req, res) => {
  res.json({
    ok: true,
    mensaje: "Esto es el API, no la página web.",
    web: "http://localhost:5173",
    health: "/api/health",
    rutas: [
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/usuarios",
      "GET /api/autos",
      "GET /api/piezas"
    ]
  });
});

app.get("/api/health", (_req, res) => {
  res.json({ ok: true });
});

app.use("/api/auth", authRouter);
app.use("/api/usuarios", usuariosRouter);
app.use("/api/autos", autosRouter);
app.use("/api/piezas", piezasRouter);

app.use((_req, res) => {
  res.status(404).json({ error: "Ruta no encontrada." });
});

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ error: "Error interno del servidor." });
});

app.listen(PORT, () => {
  console.log(`API en http://localhost:${PORT}`);
});
