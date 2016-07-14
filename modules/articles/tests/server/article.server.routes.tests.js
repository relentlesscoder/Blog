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

  it('should not be able to save an article if no titile is provided', function(done) {
    article.title = '';

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        if (signInErr) {
          return done(signInErr);
        }

        agent.post('/api/articles')
          .send(article)
          .expect(400)
          .end(function(articleSaveErr, articleSaveRes) {
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            articleSaveRes.body.message.should.match('Title is required');

            done();
          });
      });
  });

  it('should not be able to save an article if published is not set', function(done) {
    var articleObj = {
      title: 'Article Title',
      body: 'Article Body',
      publishDate: new Date()
    };

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        if (signInErr) {
          return done(signInErr);
        }

        agent.post('/api/articles')
          .send(articleObj)
          .expect(400)
          .end(function(articleSaveErr, articleSaveRes) {
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            articleSaveRes.body.message.should.match('Published is required');

            done();
          });
      });
  });

  it('should not be able to save an article if publish date is not provided', function(done) {
    var articleObj = {
      title: 'Article Title',
      body: 'Article Body',
      published: true
    };

    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        if (signInErr) {
          return done(signInErr);
        }

        agent.post('/api/articles')
          .send(articleObj)
          .expect(400)
          .end(function(articleSaveErr, articleSaveRes) {
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            articleSaveRes.body.message.should.match('Publish date is required');

            done();
          });
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

  it('should be able to get a single article if not logged in', function(done) {
    var articleObj = new Article(article);

    articleObj.save(function(err) {
      if (err) {
        return done(err);
      }

      agent.get('/api/articles/' + articleObj._id)
        .expect(200)
        .end(function(articleGetErr, articleGetRes) {
          if (articleGetErr) {
            return done(articleGetErr);
          }

          articleGetRes.body.should.be.instanceof(Object).and.have.property('title', article.title);
          (articleGetRes.body._id).should.equal(articleObj._id.toString());

          done();
        });
    });
  });

  it('should return proper error for single article with an invalid Id, if not signed in', function (done) {
    // test is not a valid mongoose Id
    request(app).get('/api/articles/test')
      .expect(400)
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'Article is invalid');

        // Call the assertion callback
        done();
      });
  });

  it('should return proper error for single article which doesnt exist, if not signed in', function (done) {
    // This is a valid mongoose Id but a non-existent article
    request(app).get('/api/articles/559e9cd815f80b4c256a8f41')
      .expect(404)
      .end(function (req, res) {
        // Set assertion
        res.body.should.be.instanceof(Object).and.have.property('message', 'No article with that identifier has been found');

        // Call the assertion callback
        done();
      });
  });

  it('should be able to update an article if logged in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        if (signInErr) {
          return done(signInErr);
        }

        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function(articleSaveErr, articleSaveRes) {
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            article.title = 'Updated Article Title';
            agent.put('/api/articles/' + articleSaveRes.body._id)
              .send(article)
              .expect(200)
              .end(function(articleUpdateErr, articleUpdateRes) {
                if (articleUpdateErr) {
                  return done(articleUpdateErr);
                }

                (articleUpdateRes.body._id).should.equal(articleSaveRes.body._id);
                (articleUpdateRes.body.title).should.match('Updated Article Title');

                done();
              });
          });
      });
  });

  it('should be able to delete an article if logged in', function(done) {
    agent.post('/api/auth/signin')
      .send(credentials)
      .expect(200)
      .end(function(signInErr, signInRes) {
        if (signInErr) {
          return done(signInErr);
        }

        agent.post('/api/articles')
          .send(article)
          .expect(200)
          .end(function(articleSaveErr, articleSaveRes) {
            if (articleSaveErr) {
              return done(articleSaveErr);
            }

            agent.delete('/api/articles/' + articleSaveRes.body._id)
              .send(article)
              .expect(200)
              .end(function(articleDeleteErr, articleDeleteRes) {
                if (articleDeleteErr) {
                  return done(articleDeleteErr);
                }

                (articleDeleteRes.body._id).should.equal(articleSaveRes.body._id);

                done();
              });
          });
      });
  });

  it('shoule not be able to delete an article is not logged in', function(done) {
    var articleObj = new Article(article);

    articleObj.save(function(err) {
      if (err) {
        return done(err);
      }

      agent.delete('/api/articles/' + articleObj._id)
        .send(article)
        .expect(403)
        .end(function(articleDeleteErr, articleDeleteRes) {
          if (articleDeleteErr) {
            return done(articleDeleteErr);
          }

          (articleDeleteRes.body.message).should.match('User is not authorized');

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
