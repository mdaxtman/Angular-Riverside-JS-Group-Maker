(function(){
  angular.module('rsvp.factory', [])
    .factory('rsvpFactory', ['$http', '$q', function($http, $q){
      return {
        getRsvps: function(eventId){

          var memberListApiCall = "https://api.meetup.com/2/profiles?group_urlname=RiversideJS&key=53e5318"+
                                  "6ab3be513c6e1a2d6b1e79&order=visited&desc=true&callback=JSON_CALLBACK";
          var rsvpListApiCall =  "https://api.meetup.com/2/rsvps/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&event_id="+ eventId + 
                                 "&sign=true&callback=JSON_CALLBACK";
          var deferred = $q.defer();
          $http.jsonp(rsvpListApiCall).success(function(r){
            var rsvpList = r.results;
            var rsvpObject = rsvpList.reduce(function(obj, curr){
              obj[curr.member.member_id] = curr.member.name;
              return obj;
            }, {});
            $http.jsonp(memberListApiCall).success(function(d){
              var memberList = d.results;
              var attending = memberList.filter(function(obj){
                if(rsvpObject[obj.member_id] !== undefined){
                  obj.answers[0].answer = parseInt(obj.answers[0].answer);
                  return true;
                }
              });
              deferred.resolve(attending);
            });
          });
          return deferred.promise;
        }
      };
    }]);
})();