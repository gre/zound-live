// FIXME: we need a zound.ui.NetworkNotification to listen to that model
zound.Network = Backbone.Model.extend({
  initialize: function(){
    this.sock = new WebSocket(WEBSOCKET_ENDPOINT);
   
    // FIXME: We should promisify the connection, then we won't need a buffer anymore :-)
    this.buffer = [];
    this.connected = false;

    this.sock.onmessage = _.bind(function(m) { 
      var o = JSON.parse(m.data);
      // FIXME We should probably not filter this because it may create inconsistency,
      // backbone should solve for the us the "not retrigger unchanged .set"
      if(o.user != window.CURRENT_USER.id){
        // console.log(o);
        this.trigger(o.type, o.data, o.user);
      }
    }, this);
    
    this.sock.onclose = _.bind(function() {
      console.log("An error occured with the WebSocket connection... Please try again.");
      this.connected = false;
      // FIXME TODO : implement a retry strategy
    }, this);

    this.sock.onopen = _.bind(function() {
      _.each(this.buffer, function(o) {
        this.sock.send(JSON.stringify(o));
      }, this);

      this.connected = true;
    }, this);
  },

  send: function(type, data) {
    var o ={
        user: CURRENT_USER.id,
        type: type,
        data: data
      };
    // console.log("send ", o);
    if(this.connected) {
      this.sock.send(JSON.stringify(o));
    }
    else this.buffer.push(o);
  }

});

