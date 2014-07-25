// Javascript pertaining to importing channels   
app.cm.addChannelListRender = function(Data){
   var H = cm.help.header() + cm.help.breadCrumb('Add Channel') + "Add Channel from " + app.cm.repo.fillSelect(Data.repository) + 
       "<p class='credentials'>Username</p><p class='credentials'>Password</p>" +
       "<br/>Send to Server <input type='text' name='serverUrl' value='http://" + Data.serverName + ":6543'>" + 
       "<input type='text' name='username' value='admin' class='cred'>" + 
       "<input type='password' name='password' value='' class='cred'>";
   H += "<table id='listChannels' cellpadding='0' cellspacing='0' border='0'></table>" + cm.help.footer();
   $('body').html(H);
   
   // We take plainly formatted JSON data from the server and reformat it into the form liked by the jQuery datatable.
   var TD= {}
   TD.aoColumns = [];
   TD.aoColumns = [ {"sTitle" : "Channel Name", "sWidth" : "19em" }, 
                    {"sTitle" : "Description"},
                    {"sTitle" : "Import", "sWidth" : "5em"}]
   TD.aaData    = [];
   List = Data.list;
   TD.aaData = [];
   
   // Build List of channels contained in the selected Repo.
   // No href attribute on anchor so action can be re-assigned with jquery click event
   for (var i = 0; i < List.name.length; i++){
      TD.aaData[i] = [ List.name[i], List.description[i],"<a class='confirm' name='#Page=confirmAddChannel&With=" 
                      + List.name[i] + "'><span class='button' style='cursor:pointer'>Import</span></a>" ]
   };
   console.log(TD);
   lib.datatable.addSearchHighlight(TD);
   $("#listChannels").dataTable(TD); 
   
   // Assign 'Confirm' Buttons Actions
   $('a.confirm').click(function(){        
      var pwField = $('input[name="password"]');      
      if($(pwField).val() === '') {         
         $(pwField).css('border','2px solid red').attr('placeholder','Password Required').keydown(function(){
            $(this).css('border','1px solid #DDDDDD').attr('placeholder','');            
         });  
      }
      else {
         var user = $('input[name="username"]').val();
         var pass = $('input[name="password"]').val();
         var path = $('input[name="serverUrl"]').val();
         var _href = $(this).attr('name');
         $(this).attr('href', _href + '&username=' + user + '&password=' + pass + '&url=' + path);
      }
   });
}   

// Get repo list & channel list
PAGE.addChannel = function(Params) {
   $.post("importList",
      {'repository': cm.settings.repository },
      function (Data) {
         console.log('This one: ' + Data.serverName);
         if (Data.err){
            var H =cm.help.header() + cm.help.breadCrumb('Add Channel');
            H += 'The repository directory ' + Data.dir + ' does not exist.';
            H += '<p>No problem - we just need to <a href="#Page=viewRepo">configure that</a>.</p>'
            H += cm.help.footer();
            $('body').html(H);
            return;
         }
         
         app.cm.addChannelListRender(Data);
            
         $('.repolist').change(".repolist", function(E){
            // TODO we might want to use a 'proper' MVC framework later.
            cm.settings.repository = $(".repolist")[0].selectedIndex;
            $('body').html(cm.help.header() + cm.help.breadCrumb('Add Channel') + "<p>Retrieving data...</p>" + cm.help.footer());
            PAGE.addChannel(Params);
         });      
      }
   );
}

// Clicked on Import.  Receives Channel List to check for existing channel and,
//   site + credentials for the server to send to    
PAGE.confirmAddChannel = function(Params) {
   $.post('remote-channels', {url: Params.url, username: Params.username, password: Params.password},
      function(D){
         console.log(D);
         var H = cm.help.header();
         
         if (Object.keys(D).length > 1){            
            var ChannelExists = false;
            for (var i=0;i < D.name.length; i++){
               if (D.name[i] === Params.With){
                  ChannelExists = true; 
               }
            }    
            H += cm.help.breadCrumb('Confirm Add Channel') + "Add Channel " + Params.With + "? ";
            if (ChannelExists){
               H += "<p><span class='warning'>This will result in replacing the existing channel by the same name.</span></p>";  
            }           
            //H += "<a href='#Page=executeAddChannel&Name=" + Params.With + "&With=" + Params.With + "'><span class='button'>Execute</span></a>";   
            H += "<a href='#Page=executeAddChannel&Name=" + Params.With + 
                                                 "&With=" + Params.With + 
                                                 "&Site=" + Params.url  +
                                                 "&User=" + Params.username +
                                                 "&Pass=" + Params.password + "'><span class='button'>Execute</span></a>";   
            
            H += "<pre style='display:inline'>     </pre><a href='#Page=addChannel'><span class='button'>Cancel</span></a>";
         }
         else {
            H += cm.help.breadCrumb("<a href='#Page=addChannel'>Add Channel</a>") + "<p>" + D[0] + "</p>";
         }
         
         H += cm.help.footer();
         $('body').html(H); 
      }
   );
}
      
PAGE.executeAddChannel = function(Params) {
   $.post("addChannel", {'name' :Params.Name, 
                         'with' :Params.With,
                         'repository' :cm.settings.repository,                         
                         'username' :Params.User,
                         'password' :Params.Pass,
                         'url' :Params.Site},
      function (Data) {
         document.location.hash = "#Page=addChannelComplete&Name=" + Params.Name + "&With=" + Params.With;
      }
   );   
}
   
PAGE.addChannelComplete = function(Params) {
   $('body').html(cm.help.header() + cm.help.breadCrumb('Added Channel') + "Added " + Params.Name + " successfully.<p><a href='#'>Return to dashboard</a>" + cm.help.footer())   
}

