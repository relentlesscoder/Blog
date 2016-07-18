'use strict';

/**
 * Module dependencies.
 */
var articlesPolicy = require('../policies/articles.server.policy'),
  articles = require('../controllers/articles.server.controller');

module.exports = function(app) {
  // Articles collection routes
  app.route('/api/articles').all(articlesPolicy.isAllowed)
    .get(articles.list)
    .post(articles.create);

  // Single article routes
  app.route('/api/articles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.read)
    .put(articles.update)
    .delete(articles.delete);

  app.route('/api/loadarticles/:articleId').all(articlesPolicy.isAllowed)
    .get(articles.articleDetails);

  app.route('/api/loadarticles').all(articlesPolicy.isAllowed)
    .get(articles.listArticles);

  app.route('/api/archives').all(articlesPolicy.isAllowed)
    .get(articles.listArchives);

  app.route('/api/archives/:year/:month').all(articlesPolicy.isAllowed)
    .get(articles.readArchive);

  // Finish by binding the article middleware
  app.param('articleId', articles.articleByID);
};
