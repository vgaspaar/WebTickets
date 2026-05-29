const router = require('express').Router();
const ctrl = require('../controllers/relatorioController');

router.get('/diario', ctrl.relatorioDiario);
router.get('/mensal', ctrl.relatorioMensal);

module.exports = router;