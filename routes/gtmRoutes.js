const express = require("express");
const router = express.Router();
const db = require("../database");

// CADASTRAR GTM
router.post("/gtm", (req, res) => {
  const { passaporte, posto, nome, funcao } = req.body;

  db.run(
    "INSERT INTO gtms (passaporte, posto, nome, funcao) VALUES (?, ?, ?, ?)",
    [passaporte, posto, nome, funcao],
    function (err) {
      if (err) return res.status(400).json({ error: "GTM já existe" });
      res.json({ success: true });
    }
  );
});

// LISTAR GTMS
router.get("/gtms", (req, res) => {
  db.all("SELECT * FROM gtms ORDER BY pontos DESC, horas DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

// INICIAR SERVIÇO
router.post("/iniciar", (req, res) => {
  const { passaporte } = req.body;
  const inicio = Date.now();
  res.json({ inicio });
});

// FINALIZAR SERVIÇO
router.post("/finalizar", (req, res) => {
  const { passaporte, duracaoHoras } = req.body;

  db.run(
    "UPDATE gtms SET horas = horas + ? WHERE passaporte = ?",
    [duracaoHoras, passaporte],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ADICIONAR PONTOS
router.post("/pontuar", (req, res) => {
  const { passaporte, pontos } = req.body;

  db.run(
    "UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?",
    [pontos, passaporte],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

// ZERAR PONTUAÇÃO (COMANDO)
router.post("/zerar", (req, res) => {
  db.run("UPDATE gtms SET pontos = 0", [], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// EXONERAR
router.delete("/gtm/:passaporte", (req, res) => {
  const { passaporte } = req.params;

  db.run("DELETE FROM gtms WHERE passaporte = ?", [passaporte], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

// AVISOS
router.get("/avisos", (req, res) => {
  db.all("SELECT * FROM avisos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json(err);
    res.json(rows);
  });
});

router.post("/avisos", (req, res) => {
  const { texto, data } = req.body;

  db.run(
    "INSERT INTO avisos (texto, data) VALUES (?, ?)",
    [texto, data],
    function (err) {
      if (err) return res.status(500).json(err);
      res.json({ success: true });
    }
  );
});

router.delete("/avisos/:id", (req, res) => {
  db.run("DELETE FROM avisos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

module.exports = router;
