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
