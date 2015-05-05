(function(){
  angular.module('groupMaker.config', [])

    .config(['$urlRouterProvider', function($urlRouterProvider){
      $urlRouterProvider.otherwise('/meetup');
    }]);
})();

(function(){
  angular.module('groupMakerApp', [
    'ui.router',
    'groupMaker.config',
    'meetup.config',
    'meetup.controller',
    'meetup.factory',
    'eventsList.factory',
    'event.config',
    'event.controller',
    'rsvp.factory',
    'disable.directive'
    ]);
})();

(function(){
  angular.module('disable.directive', [])

    .directive('disableMember', function(){
      return {
        restrict: 'A',
        scope: {
          assign : '=',
          profile: '='
        },
        link: function(scope, elem){
          elem.bind('dblclick', function(e){
            if(scope.profile.groupNumber === 'disabled'){
              scope.profile.groupNumber = 0;
              scope.assign(true);
            }else{
              scope.profile.groupNumber = 'disabled';
            }
            elem.toggleClass('disabled');
          });
        }
      };
    });
})();

(function(){

  angular.module('event.config', [])

  .config(['$stateProvider', function($stateProvider){
    $stateProvider.state('meetup.event', {
      url:'/:eventId',
      controller: 'eventCtrl',
      templateUrl: '../scripts/meetup/event/event.html',
      resolve:{
        rsvpList : ['rsvpFactory', '$stateParams', function(rsvpFactory, $stateParams){
          return rsvpFactory.getRsvps($stateParams.eventId);
        }]
      }
    });
  }]);
})();

(function(){
  angular.module('event.controller', [])

  .controller('eventCtrl', ['$scope', 'rsvpList', function($scope, rsvpList){
    $scope.roster = rsvpList;
    $scope.groups = {};
    $scope.groupSize = '';
    $scope.numberOfGroups = '';
    $scope.button = 'Create Groups';

    $scope.sortByName = function(){
      $scope.roster.sort(sortByName);
    };

    $scope.sortBySkill = function(){
      $scope.roster.sort(sortBySkill);
    };

    $scope.resetSelect = function(arg){
      if(arg === 'size'){
        $scope.numberOfGroups = '';
      }else{
        $scope.groupSize = '';
      }
    };

    $scope.assignGroups = function(assignOnlyDisabled){

      if($scope.button === 'Create Groups'){
        if($scope.groupSize !== '' || $scope){ 
          assignGroups($scope);
          createGroups($scope);
          $scope.button = 'Reset';
        }else{
          alert('please select a group size or number of Groups');
        }
      }else if(!assignOnlyDisabled){
        console.log('blah');
        $scope.button = 'Create Groups';
        var resetRoster = [];
        for(var prop in $scope.groups){
          resetRoster = resetRoster.concat($scope.groups[prop]);
        }
        $scope.roster = resetRoster.concat($scope.roster);
        $scope.groups = {};
        $scope.sortBySkill();
      }
    };

    $scope.sortBySkill();
  }]);

  function sortByName(a, b){
    if(a.name < b.name){
      return -1;
    }else if(a.name > b.name){
      return 1;
    }else{
      return 0;
    }
  }

  function sortBySkill(a, b){
    var left = parseInt(a.answers[0].answer); 
    var right = parseInt(b.answers[0].answer);
    if(isNaN(left)){
      left = 0;
    }
    if(isNaN(right)){
      right = 0;
    }
    if(right - left !== 0){
      return right - left;
    }else{
      return sortByName(a, b);
    }
  }

  function assignGroups(scope, num){
    var i, j, currentNumber, workFromFront,
      len = scope.roster.length,
      groupSize,
      numberOfGroups = num || parseInt(scope.numberOfGroups);
      
    if(!num){
      groupSize = parseInt(scope.groupSize);
    }

    if(groupSize){
      return assignGroups(scope, Math.ceil(len/groupSize));
    }else if(numberOfGroups){
      currentNumber = 1;
      workFromFront = true;
      i = 0;
      j = len - 1;
      while(i <= j){
        if(workFromFront){
          if(!scope.roster[i].groupNumber || scope.roster[i].groupNumber !== 'disabled'){
            scope.roster[i++].groupNumber = currentNumber++;
          }else{
            i++;
          }
          if(currentNumber > numberOfGroups){
            currentNumber = 1;
            workFromFront = false;
          }
        }else{
          if(!scope.roster[j].groupNumber || scope.roster[j].groupNumber !== 'disabled'){
            scope.roster[j--].groupNumber = currentNumber++;
          }else{
            j--;
          }
          if(currentNumber > numberOfGroups){
            currentNumber = 1;
            workFromFront = true;
          }
        }
      }
    }
  }

  function createGroups(scope){
    var len = scope.roster.length;
    var groupSize = parseInt(scope.groupSize);
    var number = scope.numberOfGroups !== '' ? scope.numberOfGroups : Math.ceil(len/groupSize);
    var updatedRoster = [];
    var updatedGroups = {};
    var i = 1;
    while(i <= number){
      updatedGroups[i++] = [];
    } 
    scope.roster.forEach(function(profile){
      if(profile.groupNumber !== 'disabled'){
        updatedGroups[profile.groupNumber].push(profile);
      }else{
        updatedRoster.push(profile);
      }
    });
    scope.roster = updatedRoster;
    scope.groups = updatedGroups;
  }

})();

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

(function(){

  angular.module('meetup.config', [])

    .config(['$stateProvider', function($stateProvider){
      $stateProvider.state('meetup', {
        url: '/meetup',
        controller: 'meetupCtrl',
        templateUrl: '../scripts/meetup/meetup.html',
        resolve: {
          meetupData: ['meetupFactory', '$q', function(meetupFactory, $q){
            var deferred = $q.defer();
            meetupFactory
              .success(function(result){
                deferred.resolve(result.data);
              })
              .error(function(error){
                deferred.reject(error);
              });
            return deferred.promise;
          }],
          eventData: ['eventsListFactory', 'pastEventsListFactory', '$q', function(eventsListFactory, pastEventsListFactory, $q){
            var deferred = $q.defer();
            eventsListFactory
              .success(function(data){
                if(data.results.length > 0){
                  deferred.resolve(data.results[0]);
                }else{
                  pastEventsListFactory
                    .success(function(data){
                      deferred.resolve(data.results[0]);
                    })
                    .error(function(error){
                      deferred.reject(error);
                    });
                }
              })
              .error(function(error){
                deferred.reject(error);
              });
            return deferred.promise;
          }]
        }
      });
    }]);
})();

(function(){
  angular.module('meetup.controller', [])

    .controller('meetupCtrl', ['$scope', 'meetupData', 'eventData', '$state', function($scope, meetupData, eventData, $state){
      // console.log(eventData);
      $scope.logo = meetupData.group_photo.highres_link;
      $scope.title = meetupData.name;
      $scope.caption = eventData.name;
      $state.go('meetup.event', {eventId: eventData.id} );
    }]);
})();

(function(){
  angular.module('meetup.factory', [])

  .factory('meetupFactory', ['$http', function($http){
    var groupInfoUrl = "https://api.meetup.com/riversidejs/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&sign=true&callback=JSON_CALLBACK";
    return $http.jsonp(groupInfoUrl);
  }]);
})();
