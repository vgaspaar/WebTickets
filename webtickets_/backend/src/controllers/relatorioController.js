const db = require('../config/db');

exports.relatorioDiario = async (req, res) => {
  try {
    const hoje = new Date().toISOString().slice(0, 10);

    const [totalEmitidas] = await db.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ?`, [hoje]
    );
    const [totalAtendidas] = await db.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ? AND status = 'atendida'`, [hoje]
    );
    const [porTipoEmitidas] = await db.query(
      `SELECT tipo, COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ? GROUP BY tipo`, [hoje]
    );
    const [porTipoAtendidas] = await db.query(
      `SELECT tipo, COUNT(*) as total FROM senhas WHERE DATE(data_emissao) = ? AND status = 'atendida' GROUP BY tipo`, [hoje]
    );
    const [detalhadas] = await db.query(
      `SELECT numeracao, tipo, data_emissao, data_atendimento, guiche, tempo_atendimento, status
       FROM senhas WHERE DATE(data_emissao) = ? ORDER BY data_emissao`, [hoje]
    );

    res.json({
      data: hoje,
      totalEmitidas: totalEmitidas[0].total,
      totalAtendidas: totalAtendidas[0].total,
      porTipoEmitidas,
      porTipoAtendidas,
      detalhadas
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};

exports.relatorioMensal = async (req, res) => {
  try {
    const mes = new Date().toISOString().slice(0, 7); // YYYY-MM

    const [totalEmitidas] = await db.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE_FORMAT(data_emissao, '%Y-%m') = ?`, [mes]
    );
    const [totalAtendidas] = await db.query(
      `SELECT COUNT(*) as total FROM senhas WHERE DATE_FORMAT(data_emissao, '%Y-%m') = ? AND status = 'atendida'`, [mes]
    );
    const [porTipoEmitidas] = await db.query(
      `SELECT tipo, COUNT(*) as total FROM senhas WHERE DATE_FORMAT(data_emissao, '%Y-%m') = ? GROUP BY tipo`, [mes]
    );
    const [tmMedio] = await db.query(
      `SELECT tipo, AVG(tempo_atendimento) as tm_medio FROM senhas 
       WHERE DATE_FORMAT(data_emissao, '%Y-%m') = ? AND status = 'atendida' GROUP BY tipo`, [mes]
    );

    res.json({
      mes,
      totalEmitidas: totalEmitidas[0].total,
      totalAtendidas: totalAtendidas[0].total,
      porTipoEmitidas,
      tmMedio
    });
  } catch (err) {
    res.status(500).json({ erro: err.message });
  }
};