(function(){
  angular.module('groupMaker.config', [])

    .config(['$urlRouterProvider', function($urlRouterProvider){
      $urlRouterProvider.otherwise('/meetup');
    }]);
})();
