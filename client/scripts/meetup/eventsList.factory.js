(function(){
  angular.module('eventsList.factory', [])

  .factory('eventsListFactory', ['$http', function($http){
    var upcomingEvents = "https://api.meetup.com/2/events/?format=json&key=53e53186ab3be513c6e1a2d6b1e79"+
                         "&sign=true&group_urlname=RiversideJS&status=upcoming&desc=true&callback=JSON_CALLBACK";
    return $http.jsonp(upcomingEvents);
  }])

  .factory('pastEventsListFactory', ['$http', function($http){
    var pastEvents = "https://api.meetup.com/2/events/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&"+
                     "sign=true&group_urlname=RiversideJS&status=past&desc=true&callback=JSON_CALLBACK";
    return $http.jsonp(pastEvents);
  }]);

})();
