'use strict';

var should = require('should'),
  request = require('supertest'),
  path = require('path'),
  mongoose = require('mongoose'),
  User = mongoose.model('User'),
  Article = mongoose.model('Article'),
  express = require(path.resolve('./config/lib/express'));

/**
 * Globals
 */
var app,
  agent,
  credentials,
  user,
  article;

/**
 * Article routes tests
 */
describe('Article CRUD tests', function() {

  before(function(done) {
    // Get application
    app = express.init(mongoose);
    agent = request.agent(app);

    done();
  });

  beforeEach(function(done) {
    // Create user credentials
    credentials = {
      username: 'username',
      password: 'M3@n.jsI$Aw3$0m3'
    };

    // Create a new user
    user = new User({
      firstName: 'Full',
      lastName: 'Name',
      displayName: 'Full Name',
      email: 'test@test.com',
      username: credentials.username,
      password: credentials.password,
      provider: 'local'
    });

    // Save a user to the test db and create new article
    user.save(function() {
      article = {
        title: 'Article Title',
        body: 'Article Body',
        published: true,
        publishDate: new Date()
      };

      done();
    });
  });

  it('should be able to save an article if logged in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        // Handle signin error
        if (signInErr) {
          return done(signInErr);
        }

        // Get the userId
        var userId = user.id;

        // Save a new article
        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function(articleSaveErr, articleSaveRes) {
            // Handle article save error
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            // Get a list of articles
            agent.get('/api/articles')
              .expect(200)
              .end(function(articlesGetErr, articlesGetRes) {
                // Handle article save error
                if (articlesGetErr) {
                  return done(articlesGetErr);
                }

                // Get articles list
                var articles = articlesGetRes.body;

                // Set assertions
                (articles[0].author._id).should.equal(userId);
                (articles[0].title).should.match('Article Title');

                // Call the assertion callback
                done();
              });
          });
      });
  });

  it('should not be able to save an article if not logged in', function(done) {
    // Save a new article
    agent.post('/api/articles')
      .send(article)
      .expect(403)
      .end(function(articleSaveErr, articleSaveRes) {
        if (articleSaveErr) {
          return done(articleSaveErr);
        }

        articleSaveRes.body.message.should.match('User is not authorized');

        done();
      });
  });

  it('shoule be able to get a list of articles if not logged in', function(done) {
    var articleObj = new Article(article);

    articleObj.save(function(err) {
      if (err) {
        return done(err);
      }

      agent.get('/api/articles')
        .expect(200)
        .end(function(articlesGetErr, articlesGetRes) {
          if (articlesGetErr) {
            return done(articlesGetErr);
          }

          var articles = articlesGetRes.body;

          articlesGetRes.body.should.be.instanceof(Array).and.have.lengthOf(1);
          (articles[0].title).should.match('Article Title');

          done();
        });
    });
  });

  afterEach(function(done) {
    User.remove().exec(function() {
      Article.remove().exec(done);
    });
  });

});
