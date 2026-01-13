const express = require("express");
const cors = require("cors");
const app = express();
const gtmRoutes = require("./routes/gtmRoutes");

// Middlewares
app.use(cors());
app.use(express.json());

// Prefixo de API
app.use("/api", gtmRoutes);

// Teste do backend
app.get("/", (req, res) => {
  res.json({ sucesso: true, mensagem: "Backend GTM funcionando!" });
});

// Porta
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🔥 GTM Backend rodando na porta ${PORT}`);
});
