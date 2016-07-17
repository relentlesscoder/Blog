'use strict';

/**
 * Module dependencies.
 */
var path = require('path'),
  mongoose = require('mongoose'),
  Article = mongoose.model('Article'),
  errorHandler = require(path.resolve('./modules/core/server/controllers/errors.server.controller')),
  _ = require('lodash');

/**
 * Create a Article
 */
exports.create = function (req, res) {
  var article = new Article(req.body);
  article.author = req.user;

  article.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Show the current Article
 */
exports.read = function (req, res) {
  res.json(req.article);
};

/**
 * Update a Article
 */
exports.update = function (req, res) {
  var article = req.article;

  article.title = req.body.title;
  article.abstract = req.body.abstract;
  article.body = req.body.body;
  article.published = req.body.published;
  article.publishDate = req.body.publishDate;

  article.save(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * Delete an Article
 */
exports.delete = function (req, res) {
  var article = req.article;

  article.remove(function(err) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles
 */
exports.list = function (req, res) {
  Article.find().sort('-publishDate').populate('author', 'displayName').exec(function(err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * Article middleware
 */
exports.articleByID = function (req, res, next, id) {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).send({
      message: 'Article Id is invalid'
    });
  }

  Article.findById(id).populate('author', 'displayName').exec(function (err, article) {
    if (err) {
      return next(err);
    } else if (!article) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    }
    req.article = article;
    next();
  });
};

/**
 * Load Article Detail
 */
exports.articleDetails = function (req, res) {
  var now = new Date();
  var articleId = req.params.articleId;
  if (!mongoose.Types.ObjectId.isValid(articleId)) {
    return res.status(400).send({
      message: 'Article Id is invalid'
    });
  }

  Article.findById(articleId).populate('author', 'displayName').exec(function (err, article) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else if (!article || !article.published || article.publishDate > now) {
      return res.status(404).send({
        message: 'No article with that identifier has been found'
      });
    } else {
      res.json(article);
    }
  });
};

/**
 * List of Articles (Published)
 */
exports.listArticles = function (req, res) {
  var now = new Date();
  Article.find({
    published: true,
    publishDate: { $lte: new Date(now.toISOString()) }
  }).sort('-publishDate').populate('author', 'displayName').exec(function(err, articles) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};

/**
 * List of Articles Archives
 */
exports.listArchives = function (req, res) {
  var now = new Date();
  Article.aggregate([{
    $match: {
      published: true,
      publishDate: { $lte: new Date(now.toISOString()) }
    }
  }, {
    $group: {
      _id: {
        year: { $year: '$publishDate' },
        month: { $month: '$publishDate' }
      },
      count: { $sum: 1 }
    }
  }, {
    $sort: { '_id.year': -1, '_id.month': -1 }
  }], function (err, result) {
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(result);
    }
  });
};

/**
 * List of Articles By Year and Month
 */
exports.readArchive = function (req, res) {
  var year = parseInt(req.params.year, 10);
  // JavaScript month starts with 0
  var month = parseInt(req.params.month, 10) - 1;
  var firstDayOfMonth = new Date(year, month, 1);
  var firstDayOfNextMonth = new Date(year, month + 1, 1);
  Article.find({ published: true,
    $and: [{
      publishDate: { $gte: new Date(firstDayOfMonth.toISOString()) }
    }, {
      publishDate: { $lt: new Date(firstDayOfNextMonth.toISOString()) }
    }]
  }).sort('-publishDate').exec(function (err, articles) {
    console.log(firstDayOfMonth);
    console.log(firstDayOfNextMonth);
    console.log(err);
    if (err) {
      return res.status(400).send({
        message: errorHandler.getErrorMessage(err)
      });
    } else {
      res.json(articles);
    }
  });
};
