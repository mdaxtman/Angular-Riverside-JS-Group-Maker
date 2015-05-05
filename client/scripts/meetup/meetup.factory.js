(function(){
  angular.module('meetup.factory', [])

  .factory('meetupFactory', ['$http', function($http){
    var groupInfoUrl = "https://api.meetup.com/riversidejs/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&sign=true&callback=JSON_CALLBACK";
    return $http.jsonp(groupInfoUrl);
  }]);
})();
