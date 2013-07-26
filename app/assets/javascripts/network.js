zound.Network = (function(){

   var sock = new WebSocket(WEBSOCKET_ENDPOINT);

   sock.onmessage = function (m) { 
     var o = JSON.parse(m.data); 
     console.log(o);
   }
   sock.onclose = function () {
     error.text("An error occured with the WebSocket connection... Please try again.");
   }

   function send (o) {
     sock.send(JSON.stringify(o));
   }

   return {
    send : send
   }
}());

