zound.Network = Backbone.Model.extend({
  initialize: function(){
    this.sock = new WebSocket(WEBSOCKET_ENDPOINT);
   
    this.buffer = [];
    this.connected = false;

    this.sock.onmessage = _.bind(function(m) { 
      var o = JSON.parse(m.data); 

      if(o.user != window.CURRENT_USER.get("name")){
        this.dontSend = true;
        this.trigger(o.type, o);
        this.dontSend = false;
        console.log(o);
      }
    }, this);
    
    this.sock.onclose = _.bind(function() {
      console.log("An error occured with the WebSocket connection... Please try again.");
      this.connected = false;
    }, this);

    this.sock.onopen = _.bind(function() {
      _.each(this.buffer, function(o) {
        this.sock.send(JSON.stringify(o));
      }, this);

      this.connected = true;
    }, this);
  },

  send: function(type, data) {
    if (this.dontSend) return;
    var o ={
        user: CURRENT_USER.get("name"),
        type: "ws-"+type,
        data: data
      };
    console.log("send ", o);
    if(this.connected) {
      this.sock.send(JSON.stringify(o));
    }
    else this.buffer.push(o);
  }

});

