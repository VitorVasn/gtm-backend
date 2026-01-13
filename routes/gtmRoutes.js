const express = require("express");
const router = express.Router();
const db = require("../database");

// ====================== CADASTRO DE GTM ======================
router.post("/gtm", (req, res) => {
  const { passaporte, posto, nome, funcao } = req.body;

  // Validação básica
  if (!passaporte || !posto || !nome || !funcao) {
    return res.status(400).json({ sucesso: false, mensagem: "Preencha todos os campos!" });
  }

  // Inserir no banco
  db.run(
    "INSERT INTO gtms (passaporte, posto, nome, funcao, pontos, horas) VALUES (?, ?, ?, ?, 0, 0)",
    [passaporte, posto, nome, funcao],
    function (err) {
      if (err) {
        if (err.message.includes("UNIQUE") || err.message.includes("PRIMARY KEY")) {
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

// ====================== REGISTRAR QRT ======================
router.post("/pontuar", (req, res) => {
  const { passaporte, pontos } = req.body;

  if (!passaporte || pontos == null) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  db.run(
    "UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?",
    [pontos, passaporte],
    function (err) {
      if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
      res.json({ sucesso: true, mensagem: `${pontos} pontos registrados!` });
    }
  );
});

// ====================== REGISTRAR ACOMPANHAMENTO ======================
router.post("/registrar-acomp", (req, res) => {
  const { passaporte, status } = req.body;
  if (!passaporte || !status) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  const pontos = status === "concluido" ? 3 : 1; // concluído vale mais

  db.serialize(() => {
    db.run(
      "UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?",
      [pontos, passaporte]
    );

    const texto = `Acompanhamento ${status.toUpperCase()}`;

    db.run(
      "INSERT INTO avisos (texto, data) VALUES (?, ?)",
      [texto, new Date().toLocaleString()],
      function (err) {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true, mensagem: "Acompanhamento registrado e pontuado!" });
      }
    );
  });
});

// ====================== REGISTRAR PRISÃO ======================
router.post("/registrar-prisao", (req, res) => {
  const { passaporteGTM, nomePreso, passaportePreso } = req.body;
  if (!passaporteGTM || !nomePreso || !passaportePreso) {
    return res.status(400).json({ sucesso: false, mensagem: "Parâmetros inválidos!" });
  }

  const pontos = 5; // <<< PONTOS POR PRISÃO (ajuste como quiser)

  db.serialize(() => {
    db.run(
      "UPDATE gtms SET pontos = pontos + ? WHERE passaporte = ?",
      [pontos, passaporteGTM]
    );

    const texto = `Prisão efetuada: ${nomePreso} (ID: ${passaportePreso})`;

    db.run(
      "INSERT INTO avisos (texto, data) VALUES (?, ?)",
      [texto, new Date().toLocaleString()],
      function (err) {
        if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
        res.json({ sucesso: true, mensagem: "Prisão registrada e pontuada!" });
      }
    );
  });
});

// ====================== ZERAR RANKING ======================
router.post("/zerar", (req, res) => {
  db.run("UPDATE gtms SET pontos = 0, horas = 0", [], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "Ranking zerado!" });
  });
});

// ====================== EXONERAR GTM ======================
router.delete("/gtm/:passaporte", (req, res) => {
  const { passaporte } = req.params;
  db.run("DELETE FROM gtms WHERE passaporte = ?", [passaporte], function (err) {
    if (err) return res.status(500).json({ sucesso: false, mensagem: err.message });
    res.json({ sucesso: true, mensagem: "GTM exonerado!" });
  });
});

// ====================== AVISOS ======================

// LISTAR AVISOS
router.get("/avisos", (req, res) => {
  db.all("SELECT * FROM avisos ORDER BY id DESC", [], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar avisos:", err.message);
      return res.status(500).json({ sucesso: false, mensagem: err.message });
    }
    res.json(rows);
  });
});


// CRIAR AVISO
router.post("/avisos", (req, res) => {
  const { texto } = req.body;

  if (!texto || texto.trim() === "") {
    return res.status(400).json({ sucesso: false, mensagem: "Digite o texto do aviso!" });
  }

  const data = new Date().toISOString(); // 🔥 FORMATO CORRETO

  db.run(
    "INSERT INTO avisos (texto, data) VALUES (?, ?)",
    [texto, data],
    function (err) {
      if (err) {
        console.error("Erro ao inserir aviso:", err.message);
        return res.status(500).json({ sucesso: false, mensagem: err.message });
      }

      res.json({
        sucesso: true,
        mensagem: "Aviso enviado!",
        id: this.lastID
      });
    }
  );
});


// APAGAR AVISO
router.delete("/avisos/:id", (req, res) => {
  const { id } = req.params;

  db.run("DELETE FROM avisos WHERE id = ?", [id], function (err) {
    if (err) {
      console.error("Erro ao apagar aviso:", err.message);
      return res.status(500).json({ sucesso: false, mensagem: err.message });
    }

    res.json({ sucesso: true, mensagem: "Aviso apagado!" });
  });
});


// EDITAR AVISO
router.put("/avisos/:id", (req, res) => {
  const { id } = req.params;
  const { texto } = req.body;

  if (!texto || texto.trim() === "") {
    return res.status(400).json({ sucesso: false, mensagem: "Texto inválido!" });
  }

  db.run(
    "UPDATE avisos SET texto = ? WHERE id = ?",
    [texto, id],
    function (err) {
      if (err) {
        console.error("Erro ao editar aviso:", err.message);
        return res.status(500).json({ sucesso: false, mensagem: err.message });
      }

      res.json({ sucesso: true, mensagem: "Aviso editado!" });
    }
  );
});

module.exports = router;
