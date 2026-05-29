const db = require('../config/db');

function gerarNumeracao(tipo, sequencia) {
  const now = new Date();
  const YY = String(now.getFullYear()).slice(2);
  const MM = String(now.getMonth() + 1).padStart(2, '0');
  const DD = String(now.getDate()).padStart(2, '0');
  const SQ = String(sequencia).padStart(2, '0');
  return `${YY}${MM}${DD}-${tipo}${SQ}`;
}

function calcularTM(tipo) {
  const rand = Math.random();
  if (tipo === 'SP') {
    const variacao = Math.floor(Math.random() * 6);
    return rand < 0.5 ? 15 - variacao : 15 + variacao;
  }
  if (tipo === 'SG') {
    const variacao = Math.floor(Math.random() * 4);
    return rand < 0.5 ? 5 - variacao : 5 + variacao;
  }
  if (tipo === 'SE') {
    return rand < 0.95 ? 1 : 5;
  }
}

// AC — Emitir senha no totem
exports.emitirSenha = async (req, res) => {
  try {
    const { tipo } = req.body;
    const agora = new Date();
    const hora = agora.getHours();

    // Verificação de horário (7h às 17h) — comente para testar
    // if (hora < 7 || hora >= 17) {
    //   return res.status(400).json({ erro: 'Fora do horário de atendimento (7h às 17h)' });
    // }

    const hoje = new Date().toISOString().slice(0, 10);

    // 5% das senhas são descartadas (cliente desiste)
    if (Math.random() < 0.05) {
      const [rows] = await db.query(
        `SELECT MAX(sequencia) as ultima FROM senhas WHERE tipo = ? AND DATE(data_emissao) = ?`,
        [tipo, hoje]
      );
      const sequencia = (rows[0].ultima || 0) + 1;
      const numeracao = gerarNumeracao(tipo, sequencia);
      await db.query(
        `INSERT INTO senhas (numeracao, tipo, sequencia, status, data_emissao)
         VALUES (?, ?, ?, 'descartada', NOW())`,
        [numeracao, tipo, sequencia]
      );
      return res.json({
        numeracao,
        tipo,
        status: 'descartada',
        mensagem: 'Senha emitida mas descartada (cliente desistiu)'
      });
    }

    const [rows] = await db.query(
      `SELECT MAX(sequencia) as ultima FROM senhas WHERE tipo = ? AND DATE(data_emissao) = ?`,
      [tipo, hoje]
    );
    const sequencia = (rows[0].ultima || 0) + 1;
    const numeracao = gerarNumeracao(tipo, sequencia);
    const tm = calcularTM(tipo);

    await db.query(
      `INSERT INTO senhas (numeracao, tipo, sequencia, tempo_atendimento, data_emissao)
       VALUES (?, ?, ?, ?, NOW())`,
      [numeracao, tipo, sequencia, tm]
    );

    res.json({ numeracao, tipo, sequencia, tm });
  } catch (err) {
    console.error('ERRO emitirSenha:', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// AA — Chamar próxima senha (ordem: SP -> SE -> SG)
exports.chamarProxima = async (req, res) => {
  try {
    const { guiche } = req.body;

    const [ultimaRows] = await db.query(
      `SELECT tipo FROM senhas 
       WHERE status IN ('chamada', 'atendida') 
       ORDER BY data_atendimento DESC LIMIT 1`
    );

    const ultimoTipo = ultimaRows.length > 0 ? ultimaRows[0].tipo : null;
    let ordemTipos;

    if (ultimoTipo === 'SP') {
      ordemTipos = ['SE', 'SG', 'SP'];
    } else {
      ordemTipos = ['SP', 'SE', 'SG'];
    }

    let senhaEscolhida = null;
    for (const tipo of ordemTipos) {
      const [rows] = await db.query(
        `SELECT * FROM senhas WHERE status = 'aguardando' AND tipo = ?
         ORDER BY sequencia ASC LIMIT 1`,
        [tipo]
      );
      if (rows.length > 0) {
        senhaEscolhida = rows[0];
        break;
      }
    }

    if (!senhaEscolhida) {
      return res.json({ mensagem: 'Nenhuma senha na fila' });
    }

    await db.query(
      `UPDATE senhas SET status = 'chamada', guiche = ?, data_atendimento = NOW()
       WHERE id = ?`,
      [guiche, senhaEscolhida.id]
    );

    res.json({
      senha: senhaEscolhida.numeracao,
      tipo: senhaEscolhida.tipo,
      guiche
    });
  } catch (err) {
    console.error('ERRO chamarProxima:', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// AA — Finalizar atendimento
exports.finalizarAtendimento = async (req, res) => {
  try {
    const { guiche } = req.body;
    await db.query(
      `UPDATE senhas SET status = 'atendida' WHERE guiche = ? AND status = 'chamada'`,
      [guiche]
    );
    res.json({ mensagem: 'Atendimento finalizado com sucesso' });
  } catch (err) {
    console.error('ERRO finalizarAtendimento:', err.message);
    res.status(500).json({ erro: err.message });
  }
};

// Painel — últimas 5 senhas chamadas
exports.painel = async (req, res) => {
  try {
    const [rows] = await db.query(
      `SELECT numeracao, tipo, guiche, data_atendimento FROM senhas
       WHERE status IN ('chamada', 'atendida')
       ORDER BY data_atendimento DESC LIMIT 5`
    );
    res.json(rows);
  } catch (err) {
    console.error('ERRO painel:', err.message);
    res.status(500).json({ erro: err.message });
  }
};