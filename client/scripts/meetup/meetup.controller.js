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