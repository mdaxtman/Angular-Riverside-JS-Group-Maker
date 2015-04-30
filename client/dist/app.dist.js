var sizeSelect = d.getElementById('group-size'),
  numberOfGroupsSelect = d.getElementById('group-quantity');

sizeSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    var numberOfGroups = Math.ceil(attending.length / this.value);
    groupMaker.groupModelConstructor(numberOfGroups);
    groupMaker.assignGroups(attending, this.value, null);
  }
    numberOfGroupsSelect.value = '';
});

numberOfGroupsSelect.addEventListener('change', function(){
  if(mvc.model.get('rosterModel').data.length > 0){
    groupMaker.groupModelConstructor(this.value);
    groupMaker.assignGroups(attending, null, this.value);
  }
    sizeSelect.value = '';
});

document.getElementById('name-button').addEventListener('click', function(){
  Array.prototype.sort.call(mvc.model.get('rosterModel').data, groupMaker.sortByName);
  groupMaker.updateRosterModel(); 
});

document.getElementById('experience-button').addEventListener('click', function(){
  console.log(mvc.model.get('rosterModel'));
  Array.prototype.sort.call(mvc.model.get('rosterModel').data, groupMaker.sortBySkill);
  groupMaker.updateRosterModel();
});

document.getElementById('create').addEventListener('click', groupMaker.createGroupsOnClick);


var apiCallCount = 0, RSVPList = {}, memberList, attending,
    d = document, groupList = {};  

var apis = (function(){
  return {

    config : function(){
      apiCallCount++;
      if(apiCallCount >= 4){
      //filter the memberList and create new array with rsvp members
      //this is necessary because the RSVP list doesn't have the skill list
        attending = memberList.filter(function(obj){
          return RSVPList[obj.member_id] !== undefined;
        });
        attending.sort(this.sortBySkill);

        //create model reference in framework
        this.initializeApplication(attending);
      }
    },

    //jsonp callbacks
    groupData : function(results){
      //adds group image to banner and adds the name of the group
      var bannerImg, bannerHeadline;
      bannerImg = d.getElementById('banner-img');
      bannerImg.setAttribute('src', results.data.group_photo.highres_link);
      
      bannerHeadline = d.getElementById('banner-headline');
      bannerHeadline.innerText = results.data.name;
      this.config();  
    },

    eventData : function(data){
      var bannerMeeting, script, ID, source, prevEventScript = d.getElementById('previous-events');

      if(data.results && data.results.length > 0){
        //adds event title
        bannerMeeting = d.getElementById('banner-meeting');
        bannerMeeting.innerText = data.results[0].name;
        
        //picks up event id for upcoming event and adds another script tag to obtain rsvps for that event
        ID = data.results[0].id;
        source = 'https://api.meetup.com/2/rsvps/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&event_id='+ ID + '&sign=true&callback=groupMaker.rsvpData';
        
        script = d.createElement('script');
        script.setAttribute('src', source);
        d.body.appendChild(script);
        this.config();
      }else if(!prevEventScript){
        prevEventScript = d.createElement('script');
        prevEventScript.setAttribute('src', "https://api.meetup.com/2/events/?format=json&key=53e53186ab3be513c6e1a2d6b1e79&sign=true&group_urlname=RiversideJS&status=past&desc=true&callback=groupMaker.eventData");
        prevEventScript.setAttribute('id', 'previous-events');
        d.body.appendChild(prevEventScript);
      }
    },

    memberData : function(data){
      //retreives the full list of 200 most recently visiting members to the page
      memberList = data.results;
      this.config();
    },

    rsvpData : function(data){
      //retreives all rsvps for a particular event
      data.results.forEach(function(obj){
        RSVPList[obj.member.member_id] = obj.member.name; 
      });
      this.config();
    }
  };



})();

var groupMaker = (function (){
  
    var obj = {
      initializeApplication: function(){
        mvc.model.construct('rosterModel', attending);
        mvc.view.construct('groupsView', 
          '<div class="col-md-3">'+
            '<div class="panel panel-default">'+        
              '<div class="panel-heading">'+          
                '<div class="panel-title" mvc-render="\'Group \' + value.groupNumber">'+
                '</div>'+
              '</div>'+
              '<div class="panel-body">'+
                '<mvc-component mvc-attr="which=\'group-\' + value.groupNumber"></mvc-component>'+
              '</div>'+
            '</div>'+
          '</div>'
          );
        mvc.view.construct('rosterView', 
        '<li class="list-group-item names" mvc-attr="title=value.bio || \'I did not bother writing a bio\'">'+ 
          '<p class="text-center">'+
            '<img class="thumbnail-photo pull-left" mvc-attr="src=value.photo.thumb_link">'+
            '<a mvc-attr="href=value.profile_url" target="_blank" mvc-render="value.name" class="name-tag">'+
            '</a>'+ 
            '<span mvc-render="parseInt(value.answers[0].answer) || 0" class="badge pull-right alert-info">'+
            '</span>'+
          '</p>'+
        '</li>'
        );
        mvc.update({
          model: 'rosterModel',
          toView: 'rosterView',
          component: 'roster'
        });
      }
    };
  var args = Array.prototype.slice.call(arguments);
  while(args.length > 0){
    var a = args.shift();
    for (var prop in a){
      obj[prop] = a[prop];
    }
  }
  return obj;
})(apis, helperFunctions);

var helperFunctions = (function(){

  return {

    sortBySkill : function(a, b){
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
        return helperFunctions.sortByName(a, b);
      }
    },

    sortByName : function(a, b){
      if(a.name < b.name){
        return -1;
      }else if(a.name > b.name){
        return 1;
      }else{
        return 0;
      }
    },
    
    groupModelConstructor : function(num){
      var model = [];
      for(var i = 1; i <= num; i++){
        var obj = {
          groupNumber: i,
          members : [],
        };
        model.push(obj);
      }
      mvc.model.construct('groupModel', model);
    },
    
    assignGroups : function(attendModel, groupSize, numberOfGroups){
      var i, j, currentNumber, workFromFront, len = attendModel.length;
      if(groupSize){
        return this.assignGroups(attendModel, null, Math.ceil(len/groupSize));
      }else if(numberOfGroups){
        currentNumber = 1;
        workFromFront = true;
        i = 0;
        j = len - 1;
        while(i <= j){
          if(workFromFront){
            attendModel[i++].groupNumber = currentNumber++;
            if(currentNumber > parseInt(numberOfGroups)){
              currentNumber = 1;
              workFromFront = false;
            }
          }else{
            attendModel[j--].groupNumber = currentNumber++;
            if(currentNumber > parseInt(numberOfGroups)){
              currentNumber = 1;
              workFromFront = true;
            }
          }
        }
      }
    },

    combineViews : function(){ 
      attending.forEach(function(member){
        if(!groupList['group-' + member.groupNumber]){
          groupList['group-' + member.groupNumber] = [];
        }
        groupList['group-' + member.groupNumber].push(member);
      });
       for(var prop in groupList){
          mvc.model.construct(prop, groupList[prop]);
          mvc.update({
            model: prop,
            toView: 'rosterView',
            component: prop
          });
       }
       mvc.model.update('rosterModel', []);
       this.updateRosterModel();
    },

    updateRosterModel : function(){
      mvc.update({
        model: 'rosterModel',
        toView: 'rosterView',
        component: 'roster'
      });
    },

    updateGroupModel : function(){
      mvc.update({
        model: 'groupModel',
        toView: 'groupsView',
        component: 'groups'
      });
    },

    resetRosterOnClick : function(){
      var rosterModel = [];
      for(var key in groupList){
        var clone = groupList[key].slice();
        rosterModel = rosterModel.concat(clone);
      }
      groupList = {};
      rosterModel.sort(this.sortBySkill);
      mvc.model.update('rosterModel', rosterModel);
      mvc.model.update('groupModel', []);
      this.removeEventListener('click', groupMaker.resetRosterOnClick);
      this.addEventListener('click', groupMaker.createGroupsOnClick);
      this.innerText = 'Create Groups';
      sizeSelect.removeAttribute('disabled');
      numberOfGroupsSelect.removeAttribute('disabled');
      sizeSelect.value = '';
      numberOfGroupsSelect.value = '';
      groupMaker.updateGroupModel();
      groupMaker.updateRosterModel();
    },
  
    createGroupsOnClick : function(){
      if(sizeSelect.value.length === 0 && numberOfGroupsSelect.value.length === 0){
        alert('please select number of groups or the group sizes you wish to create');
      }else{
        groupMaker.updateGroupModel();
        groupMaker.combineViews();
        this.removeEventListener('click', groupMaker.createGroupsOnClick);
        this.addEventListener('click', groupMaker.resetRosterOnClick);
        this.innerText = 'Reset Roster';
        sizeSelect.setAttribute('disabled', 'true');
        numberOfGroupsSelect.setAttribute('disabled', 'true');
      }
    }
  };

})();
