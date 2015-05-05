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