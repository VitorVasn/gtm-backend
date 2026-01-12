const express = require("express");
const cors = require("cors");
const app = express();
require("./database");

const gtmRoutes = require("./routes/gtmRoutes");

app.use(cors());
app.use(express.json());

app.use("/api", gtmRoutes);

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log("🔥 GTM Backend rodando na porta " + PORT);
});
