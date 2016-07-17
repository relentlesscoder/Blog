(function() {
  'use strict';

  angular
    .module('articles')
    .controller('ArticlesController', ArticlesController);

  ArticlesController.$inject = ['$scope', '$stateParams', '$location', '$http', 'Authentication', 'Articles'];

  function ArticlesController($scope, $stateParams, $location, $http, Authentication, Articles) {
    var vm = this;
    $scope.authentication = Authentication;

    // Configure tinymce options
    $scope.tinymceOptions = {
      selector: 'textarea',
      inline: false,
      skin: 'lightgray',
      theme: 'modern',
      plugins: [
        'advlist autolink link image lists charmap print preview hr anchor pagebreak spellchecker',
        'searchreplace wordcount visualblocks visualchars code fullscreen insertdatetime media nonbreaking',
        'save table contextmenu directionality emoticons template paste textcolor'
      ],
      menubar: 'edit insert view format tools',
      toolbar: ['undo redo cut copy paste | link image | print preview fullscreen',
        'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | forecolor backcolor | formatselect fontselect fontsizeselect '
      ],
      file_browser_callback: function(field_name, url, type, win) {
        // Configure the file browser callback
      }
    };

    $scope.today = function() {
      $scope.publishDate = new Date();
    };
    $scope.today();

    $scope.clear = function() {
      $scope.publishDate = null;
    };

    $scope.dateOptions = {
      formatYear: 'yy',
      maxDate: new Date(2050, 1, 1),
      minDate: new Date(2016, 1, 1),
      startingDay: 1
    };

    $scope.openDatePicker = function() {
      $scope.popupDatePicker.opened = true;
    };

    $scope.setDate = function(year, month, day) {
      $scope.publishDate = new Date(year, month, day);
    };

/*    $scope.formats = ['dd-MMMM-yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
    $scope.format = $scope.formats[0];
    $scope.altInputFormats = ['M!/d!/yyyy'];*/

    $scope.popupDatePicker = {
      opened: false
    };

    var tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    var afterTomorrow = new Date();
    afterTomorrow.setDate(tomorrow.getDate() + 1);
    $scope.events = [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

    function getDayClass(data) {
      var date = data.date,
        mode = data.mode;
      if (mode === 'day') {
        var dayToCheck = new Date(date).setHours(0, 0, 0, 0);

        for (var i = 0; i < $scope.events.length; i++) {
          var currentDay = new Date($scope.events[i].date).setHours(0, 0, 0, 0);

          if (dayToCheck === currentDay) {
            return $scope.events[i].status;
          }
        }
      }

      return '';
    }

    // Create new Article
    $scope.create = function(isValid) {
      $scope.error = null;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      // Create new Article object
      var article = new Articles({
        title: this.title,
        abstract: this.abstract,
        body: this.content,
        published: this.published ? this.published : false,
        publishDate: this.publishDate
      });

      article.$save(function(response) {
        $location.path('articles/');

        $scope.title = '';
        $scope.abstract = '';
        $scope.body = '';
        $scope.published = false;
        $scope.publishDate = null;
      }, function(errResponse) {
        $scope.error = errResponse.data.message;
      });
    };

    // Find a list of Articles
    $scope.find = function() {
      $scope.articles = Articles.query();
    };

    // Find an existing Article
    $scope.findOne = function() {
      $scope.article = Articles.get({
        articleId: $stateParams.articleId
      });
      $scope.article.$promise.then(function(result) {
        $scope.publishDate = Date.parse(result.publishDate);
      });
    };

    $scope.update = function(isValid) {
      $scope.error = null;
      $scope.updated = false;

      if (!isValid) {
        $scope.$broadcast('show-errors-check-validity', 'articleForm');

        return false;
      }

      var article = $scope.article;
      article.publishDate = $scope.publishDate;
      article.$update(function() {
        $scope.updated = true;
      }, function(errResponse) {
        $scope.error = errResponse.data.message;
      });
    };

    $scope.remove = function(article) {
      if (article) {
        article.$remove();

        for (var i in $scope.articles) {
          if ($scope.articles[i] === article) {
            $scope.articles.splice(i, 1);
          }
        }
      } else {
        $scope.article.$remove(function () {
          $location.path('articles');
        });
      }
    };

    $scope.loadArticles = function() {
      $http.get('api/loadarticles')
        .then(function(response) {
          $scope.articles = response.data;
        }, function(errResponse) {
          // Error handling
        });
    };

    $scope.articleDetails = function() {
      $http.get('api/articles/" + $stateParams.articleId + "/display')
        .then(function(response) {
          $scope.article = response.data;
        }, function(errResponse) {
          // Error handling
        });
    };

    $scope.loadArchives = function() {
      $http.get('api/archives')
        .then(function(response) {
          $scope.archives = response.data;
        }, function(errResponse) {
          // Error handling
        });
    };

    $scope.loadArchiveArticles = function() {
      var year = $stateParams.year;
      var month = $stateParams.month;
      $http.get('api/archives/' + year + '/' + month)
        .then(function(response) {
          $scope.archiveArticles = response.data;
        }, function(errResponse) {
          // Error handling
        });
    };
  }
}());
