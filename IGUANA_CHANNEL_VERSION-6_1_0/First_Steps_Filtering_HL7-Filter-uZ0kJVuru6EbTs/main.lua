-- In this script we take an incoming HL7 feed and filter out the
-- non ADT messages.  If you'd like to learn how it works, and learn
-- more about Iguana, take our first steps course at:
-- http://training.interfaceware.com/course/first-steps

function main(Data)
   -- Parse the HL7 message
   local Msg, Name = hl7.parse{vmd = 'example/demo.vmd', data = Data}
   local Out       = hl7.message{vmd = 'example/demo.vmd', name=Name}   
   
   -- Filter Criteria
   local filter = {
      msg_type = 'ADT' == Name,
      recv_fac = 'St. Micheals' == Msg.MSH[6][1]:nodeValue()
   }
	local all_pass = true
   local reason = ''
   
   for field,value in pairs(filter) do
      if value == false then
         all_pass = false
         reason = reason .. field .. ', '
      end
   end
   
   if all_pass then
      -- (1) Map information from the incoming to the outgoing message
      Out:mapTree(Msg)                              
      
      -- (2) Transform the outgoing message as needed  
      Out.MSH[3][1] = 'First Steps'      
      Out.MSH[4][1] = 'Rick Thiessen'

      -- (3) Push the outgoing message into the Iguana queue
      queue.push{data=Out}
      
   else     
      -- (4) Write a log entry why message was filtered
      iguana.logInfo('Message ' ..
         iguana.messageId() .. ' was filtered on: ' .. reason:sub(1,-3)
      )
   end
end