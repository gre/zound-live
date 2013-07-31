zound.Network = Backbone.Model.extend({
  initialize: function(){
    this.sock = new WebSocket(WEBSOCKET_ENDPOINT);
   
    this.buffer = [];
    this.connected = false;

    this.sock.onmessage = _.bind(function(m) { 
      var o = JSON.parse(m.data);

      if(o.user != window.CURRENT_USER.id){
        //console.log(o);
        this.dontSend = true;
        this.trigger(o.type, o.data, o.user);
        this.dontSend = false;
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
        user: CURRENT_USER.id,
        type: type,
        data: data
      };
    //console.log("send ", o);
    if(this.connected) {
      this.sock.send(JSON.stringify(o));
    }
    else this.buffer.push(o);
  }

});

