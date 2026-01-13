const express = require("express");
const router = express.Router();
const db = require("../database");

// ====================== FUNÇÃO DATA BR ======================
function dataBrasil() {
  return new Date().toLocaleString("pt-BR", { timeZone: "America/Sao_Paulo" });
}

// ====================== CADASTRO DE GTM ======================
router.post("/gtm", (req, res) => {
  const { passaporte, posto, nome, funcao } = req.body;

  if (!passaporte || !posto || !nome || !funcao) {
    return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos!" });
  }

  db.run(
    "INSERT INTO gtms (passaporte, posto, nome, funcao, pontos, horas) VALUES (?, ?, ?, ?, 0, 0)",
    [passaporte, posto, nome, funcao],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE")) {
          return res.status(400).json({ sucesso: false, mensagem: "GTM já existe!" });
        }
        return res.status(500).json({ sucesso: false, mensagem: err.message });
      }
      res.json({ sucesso: true, mensagem: "GTM cadastrado com sucesso!" });
    }
  );
});

// ====================== LISTAR GTMS ======================
router.get("/gtms", (req, res) => {
  db.all("SELECT * FROM gtms ORDER BY pontos DESC, horas DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json(rows);
  });
});

// ====================== FINALIZAR SERVIÇO ======================
router.post("/finalizar", (req, res) => {
  const { passaporte, duracaoHoras } = req.body;

  if (!passaporte || duracaoHoras == null) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  db.run(
    "UPDATE gtms SET horas = horas + ? WHERE passaporte = ?",
    [duracaoHoras, passaporte],
    function (err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, mensagem: "Serviço finalizado!" });
    }
  );
});

// ====================== QRT ======================
router.post("/pontuar", (req, res) => {
  const { passaporte, pontos } = req.body;

  if (!passaporte || pontos == null) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  db.get("SELECT nome FROM gtms WHERE passaporte = ?", [passaporte], (err, gtm) => {
    if (err || !gtm) {
      return res.status(404).json({ sucesso: false, mensagem: "GTM não encontrado" });
    }

    const texto = `${gtm.nome} recebeu ${pontos} pontos no QRT`;
    const data = dataBrasil();

    db.serialize(() => {
      db.run("UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?", [pontos, passaporte]);
      db.run("INSERT INTO avisos (texto, data) VALUES (?, ?)", [texto, data], function (err) {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true, mensagem: `${pontos} pontos registrados e aviso gerado!` });
      });
    });
  });
});

// ====================== ACOMPANHAMENTO ======================
router.post("/registrar-acomp", (req, res) => {
  const { passaporte, status } = req.body;

  if (!passaporte || !status) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  const pontos = status === "concluido" ? 3 : 1;

  db.get("SELECT nome FROM gtms WHERE passaporte = ?", [passaporte], (err, gtm) => {
    if (err || !gtm) {
      return res.status(404).json({ sucesso: false, mensagem: "GTM não encontrado" });
    }

    const texto = `${gtm.nome} realizou acompanhamento (${status})`;
    const data = dataBrasil();

    db.serialize(() => {
      db.run("UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?", [pontos, passaporte]);
      db.run("INSERT INTO avisos (texto, data) VALUES (?, ?)", [texto, data], function (err) {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true, mensagem: "Acompanhamento registrado e pontuado!" });
      });
    });
  });
});

// ====================== PRISÃO ======================
router.post("/registrar-prisao", (req, res) => {
  const { passaporteGTM, nomePreso, passaportePreso } = req.body;

  if (!passaporteGTM || !nomePreso || !passaportePreso) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  const pontos = 5;

  db.get("SELECT nome FROM gtms WHERE passaporte = ?", [passaporteGTM], (err, gtm) => {
    if (err || !gtm) {
      return res.status(404).json({ sucesso: false, mensagem: "GTM não encontrado" });
    }

    const texto = `${gtm.nome} efetuou prisão de ${nomePreso} (ID: ${passaportePreso})`;
    const data = dataBrasil();

    db.serialize(() => {
      db.run("UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?", [pontos, passaporteGTM]);
      db.run("INSERT INTO avisos (texto, data) VALUES (?, ?)", [texto, data], function (err) {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true, mensagem: "Prisão registrada e pontuada!" });
      });
    });
  });
});

// ====================== ZERAR RANKING ======================
router.post("/zerar", (req, res) => {
  db.run("UPDATE gtms SET pontos = 0, horas = 0", [], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Ranking zerado!" });
  });
});

// ====================== EXONERAR ======================
router.delete("/gtm/:passaporte", (req, res) => {
  const { passaporte } = req.params;

  db.run("DELETE FROM gtms WHERE passaporte = ?", [passaporte], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "GTM exonerado!" });
  });
});

// ====================== AVISOS ======================
router.get("/avisos", (req, res) => {
  db.all("SELECT * FROM avisos ORDER BY id DESC", [], (err, rows) => {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json(rows);
  });
});

router.post("/avisos", (req, res) => {
  const { texto, passaporte } = req.body;

  if (!texto || !passaporte) {
    return res.status(400).json({ sucesso: false, mensagem: "Dados inválidos!" });
  }

  db.get("SELECT nome FROM gtms WHERE passaporte = ?", [passaporte], (err, gtm) => {
    if (err || !gtm) {
      return res.status(404).json({ sucesso: false, mensagem: "GTM não encontrado" });
    }

    const textoFinal = `${gtm.nome}: ${texto}`;
    const data = dataBrasil();

    db.run("INSERT INTO avisos (texto, data) VALUES (?, ?)", [textoFinal, data], function (err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, mensagem: "Aviso enviado!" });
    });
  });
});

router.delete("/avisos/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM avisos WHERE id = ?", [id], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Aviso apagado!" });
  });
});

router.put("/avisos/:id", (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto) {
    return res.status(400).json({ sucesso: false, mensagem: "Texto inválido!" });
  }

  db.run("UPDATE avisos SET texto = ? WHERE id = ?", [texto, id], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Aviso editado!" });
  });
});

module.exports = router;
