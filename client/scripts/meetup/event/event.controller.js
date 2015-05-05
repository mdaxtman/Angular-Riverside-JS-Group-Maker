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
