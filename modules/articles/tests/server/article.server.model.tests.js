'use strict';

/**
 * Module dependencies.
 */
var should = require('should'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Article = mongoose.model('Article');

/**
 * Globals
 */
var user,
  article;

/**
 * Unit tests
 */
describe('Article Model Unit Tests:', function() {
  beforeEach(function(done) {
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: 'username',
      password: 'password'
    });

    user.save(function() {
      article = new Article({
        title: 'Article Title',
        body: 'Article Body',
        published: true,
        publishDate: new Date(),
        user: user
      });

      done();
    });
  });

  describe('Method Save', function() {
    it('should be able to save without problems', function(done) {
      return article.save(function(err) {
        should.not.exist(err);
        done();
      });
    });

    it('should be able to show an error when try to save without title', function(done) {
      article.title = '';

      article.save(function(err) {
        should.exist(err);
        err.message.should.match('Article validation failed');
        done();
      });
    });

    it('should be able to show an error when try to save without published', function(done) {
      var article1 = new Article({
        title: 'Article Title',
        body: 'Article Body',
        publishDate: new Date(),
        user: user
      });

      article1.save(function(err) {
        should.exist(err);
        err.message.should.match('Article validation failed');
        done();
      });
    });

    it('should be able to show an error when try to save without publish date', function(done) {
      var article2 = new Article({
        title: 'Article Title',
        body: 'Article Body',
        published: true,
        user: user
      });

      article2.save(function(err) {
        should.exist(err);
        err.message.should.match('Article validation failed');
        done();
      });
    });
  });

  afterEach(function(done) {
    Article.remove().exec();
    User.remove().exec();

    done();
  });
});
