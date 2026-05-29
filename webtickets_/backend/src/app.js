require('dotenv').config();
const express = require('express');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

app.use('/api/senhas', require('./routes/senhas'));
app.use('/api/relatorios', require('./routes/relatorios'));

const PORT = process.env.PORT;
console.log('PORT lida:', PORT); // debug temporário

app.listen(PORT, () => {
  console.log(`✅ Servidor rodando na porta ${PORT}`);
});