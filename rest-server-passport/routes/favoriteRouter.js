var express = require('express');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');

var Favorites = require('../models/favorites');
var Verify = require('./verify');

var favoriteRouter = express.Router();
favoriteRouter.use(bodyParser.json());

favoriteRouter.route('/')
    .get(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({'postedBy': req.decoded._doc._id})
            .populate('postedBy')
            .populate('dishes')
            .exec(function (err, favourite) {
                if (err) throw err;
                res.json(favourite);
            });
    })

    .post(Verify.verifyOrdinaryUser, function (req, res, next) {
        var addDish = function(favourite, dishId) {
            if (favourite.dishes.indexOf(dishId) == -1) {
                favourite.dishes.push(dishId);
                favourite.save(function (err, favourite) {
                    if (err) throw err;
                    console.log('Updated favourites!');
                    res.json(favourite);
                });
            } else {
                res.json(favourite);
            }
        };
        if (!req.body._id) {
            throw 'dish id can not be empty';
        }
        Favorites.findOne({'postedBy': req.decoded._doc._id}, function (err, favourite) {
            if (err) throw err;
            if (!favourite) {
                Favorites.create({postedBy: req.decoded._doc._id, dishes: []}, function (err, favourite) {
                    if (err) throw err;
                    console.log('Favourite created!');
                    addDish(favourite, req.body._id);
                });
            } else {
                addDish(favourite, req.body._id);
            }
        });
    })

    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({'postedBy': req.decoded._doc._id}, function (err, favourite) {
            if (err) throw err;
            favourite.remove();
            console.log('Deleted favourite');
            res.json(null);
        });
    });

favoriteRouter.route('/:dishId')
    .delete(Verify.verifyOrdinaryUser, function (req, res, next) {
        Favorites.findOne({'postedBy': req.decoded._doc._id}, function (err, favourite) {
            if (err) throw err;
            var dishIndex = favourite.dishes.indexOf(req.params.dishId);
            if (dishIndex > -1) {
                favourite.dishes.splice(dishIndex, 1);
            }

            if (favourite.dishes.length == 0) {
                favourite.remove();
                console.log('Deleted favourite');
                res.json(null);
            } else {
                favourite.save(function (err, favourite) {
                    console.log('Deleted favourite dish');
                    res.json(favourite);
                });
            }
        });
    });

module.exports = favoriteRouter;