var express = require('express');
var dishRouter = express.Router();

var bodyParser = require('body-parser');
dishRouter.use(bodyParser.json());

dishRouter.route('/dishes');

console.log("entro");

dishRouter
    .all('/', function(req, res, next){
        res.writeHead(200, {'Content-Type': 'application/json'});
        next();
    })
    .get('/', function(req, res, next){
        res.end('will send all dishes to you');
    })
    .get('/:dishId', function(req, res, next){
        res.end('will send the dish '+ req.params.dishId + ' to you');
    })
    .post('/', function(req, res, next){
        res.end('will add  the dish '+ req.body.name + ' with details ' + req.body.description);
    })
    .put('/:dishId', function(req, res, next){
        res.write('Updating the dish '+ req.params.dishId+ ' ');
        res.end(' Updating the dish '+ req.body.name + ' with details '+ req.body.description);
    })
    .delete('/', function(req, res, next){
        res.end('Deleteing all dishes');
    })
    .delete('/:dishId', function(req, res, next){
        res.end('Deleteing the dish '+ req.params.dishId);
    });

module.exports = dishRouter;