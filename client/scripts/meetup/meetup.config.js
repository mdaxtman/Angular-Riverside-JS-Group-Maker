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
