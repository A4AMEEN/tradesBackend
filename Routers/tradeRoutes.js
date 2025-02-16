const express = require('express');
const router = express.Router();
const upload = require('../middlewares/u/upload');
const tradeController = require('../Controllers/tradeController');

router.get('/trades', tradeController.getAllTrades);
router.get('/trading', tradeController.getAllPlayerTrades);
router.post('/create', tradeController.createPlayerTrade);
router.get('/:id', tradeController.getTradeById);
router.put('/update/:id', upload.single('image'), tradeController.updateTrade);
router.post('/addTrade', upload.single('image'), tradeController.createTrade);
router.patch('/toggle-stock/:id', tradeController.toggleTradeStock);
router.patch('/status/:id', tradeController.updateTradeStatus);
router.get('/player-trades/:userId', tradeController.getPlayerTrades);
router.patch('/cancel-trade/:tradeId', tradeController.cancelTrade);

module.exports = router;