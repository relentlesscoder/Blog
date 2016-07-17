'use strict';

/**
 * Module dependencies.
 */
var mongoose = require('mongoose'),
  Schema = mongoose.Schema;

/**
 * Article Schema
 */
var ArticleSchema = new Schema({
  createdDate: {
    type: Date
  },
  updatedDate: {
    type: Date
  },
  title: {
    type: String,
    default: '',
    trim: true,
    required: 'Title is required'
  },
  abstract: {
    type: String,
    default: '',
    trim: true
  },
  body: {
    type: String,
    default: '',
    trim: true
  },
  published: {
    type: Boolean,
    required: 'Published is required'
  },
  publishDate: {
    type: Date,
    required: 'Publish date is required'
  },
  author: {
    type: Schema.ObjectId,
    ref: 'User'
  }
});

ArticleSchema.pre('save', function(next) {
  // Get current datetime
  var currentDate = new Date();

  // Update updated date
  this.updatedDate = currentDate;

  // Set created date when the article is created
  if (this.createdDate) {
    this.createdDate = currentDate;
  }

  next();
});

mongoose.model('Article', ArticleSchema);
