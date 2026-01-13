const express = require("express");
const router = express.Router();
const db = require("../database");

// ------------------- CADASTRO -------------------
router.post("/gtm", (req, res) => {
  const { passaporte, posto, nome, funcao } = req.body;
  if (!passaporte || !posto || !nome || !funcao)
    return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos!" });

  db.run(
    "INSERT INTO gtms (passaporte, posto, nome, funcao, pontos, horas) VALUES (?, ?, ?, ?, 0, 0)",
    [passaporte, posto, nome, funcao],
    function (err) {
      if (err) return res.status(400).json({ sucesso: false, mensagem: "GTM já existe!" });
      res.json({ sucesso: true, mensagem: "GTM cadastrado com sucesso!" });
    }
  );
});

// ------------------- LISTAR GTMS -------------------
router.get("/gtms", (req, res) => {
  db.all("SELECT * FROM gtms ORDER BY pontos DESC, horas DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json(rows);
  });
});

// ------------------- FINALIZAR SERVIÇO -------------------
router.post("/finalizar-servico", (req, res) => {
  const { passaporte, horas } = req.body;
  db.run(
    "UPDATE gtms SET horas = horas + ? WHERE passaporte = ?",
    [horas, passaporte],
    function (err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, mensagem: "Serviço finalizado!" });
    }
  );
});

// ------------------- REGISTRAR PONTOS -------------------
router.post("/registrar-qrt", (req, res) => {
  const { passaporte, quantidade } = req.body;
  db.run(
    "UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?",
    [quantidade, passaporte],
    function (err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, mensagem: `${quantidade} pontos registrados!` });
    }
  );
});

// ------------------- ZERAR RANKING -------------------
router.post("/zerar-ranking", (req, res) => {
  db.run("UPDATE gtms SET pontos = 0, horas = 0", [], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Ranking zerado!" });
  });
});

// ------------------- EXONERAR -------------------
router.post("/exonerar", (req, res) => {
  const { passaporte } = req.body;
  db.run("DELETE FROM gtms WHERE passaporte = ?", [passaporte], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "GTM exonerado!" });
  });
});

// ------------------- AVISOS -------------------
router.get("/avisos", (req, res) => {
  db.all("SELECT * FROM avisos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json(rows);
  });
});

router.post("/avisos", (req, res) => {
  const { texto } = req.body;
  const data = new Date().toLocaleString();
  db.run("INSERT INTO avisos (texto, data) VALUES (?, ?)", [texto, data], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Aviso enviado!" });
  });
});

router.delete("/avisos/:id", (req, res) => {
  db.run("DELETE FROM avisos WHERE id = ?", [req.params.id], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Aviso apagado!" });
  });
});

module.exports = router;
