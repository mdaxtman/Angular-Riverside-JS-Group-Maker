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
