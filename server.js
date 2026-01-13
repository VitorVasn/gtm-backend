const express = require("express");
const cors = require("cors");

// Inicializa a conexão com o banco
require("./database");

// Importa as rotas
const gtmRoutes = require("./routes/gtmRoutes");

const app = express();

// Middlewares
app.use(cors({ origin: "*" })); // Permite acesso de qualquer domínio
app.use(express.json()); // Para receber JSON no body

// Rotas
app.use("/api", gtmRoutes);

// Porta
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`🔥 GTM Backend rodando na porta ${PORT}`);
});
