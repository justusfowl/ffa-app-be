var express = require('express'); 
var router = express.Router();
var newsCtrl = require('../controllers/news.controller')

router.route('/')
    .get(newsCtrl.getNews)

router.route('/:newsId')
    .get(newsCtrl.getNews)

module.exports = router;