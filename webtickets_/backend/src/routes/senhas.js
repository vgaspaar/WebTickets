const router = require('express').Router();
const ctrl = require('../controllers/senhaController');

router.post('/emitir', ctrl.emitirSenha);
router.post('/chamar', ctrl.chamarProxima);
router.post('/finalizar', ctrl.finalizarAtendimento);
router.get('/painel', ctrl.painel);

module.exports = router;