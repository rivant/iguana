function cm.app.remoteChannels(Req)            
   local T = {name={}, status={}, source={}, destination={}} 
   local post = {}
   urlcode.parseQuery(Req.body, post)   
   
   local Success, Server = pcall(iguanaServer.connect, {
         url=post.url,       
         username=post.username, password=post.password})
   
   --Server:addChannel{}
   --iguana.channel.add()
   if Success then
      local Conf = Server:listChannels().IguanaStatus
      
      local Components = {
         ['From Translator'] = 'TRANS',
         ['To Translator']   = 'TRANS',
         ['From File']  = 'FILE',
         ['To File']    = 'FILE',
         ['To Database'] = 'DB',
         ['From Database'] = 'DB',
         ['From HTTPS'] = 'HTTPS',
         ['To HTTPS']   = 'HTTPS',
         ['LLP Listener'] = 'LLP',
         ['LLP Client']   = 'LLP',
         ['From Channel'] = 'QUE',
         ['To Channel']   = 'QUE',
         ['To Plugin']    = 'PLG-N',
         ['From Plugin']  = 'PLG-N'}
      
      for i=1, Conf:childCount('Channel') do
         local Ch = Conf:child('Channel', i)
         T.name[#T.name+1] = Ch.Name
         T.status[#T.status+1] = Ch.Status     
         T.source[#T.source+1] = Components[Ch.Source:nodeValue()];
         T.destination[#T.destination+1] = Components[Ch.Destination:nodeValue()];
      end
   else
      T = {Server}
   end

   return T
end
