const express = require("express");
const cors = require("cors");
const app = express();
require("./database"); // Conexão com SQLite

const gtmRoutes = require("./routes/gtmRoutes");

// ===== Configurações =====
app.use(cors({ origin: "*" })); // libera para qualquer frontend
app.use(express.json());

// ===== Rota raiz para teste =====
app.get("/", (req, res) => {
  res.json({ sucesso: true, mensagem: "Backend GTM funcionando!" });
});

// ===== Rotas da API =====
app.use("/api", gtmRoutes);

// ===== Inicialização do servidor =====
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 GTM Backend rodando na porta ${PORT}`);
});
