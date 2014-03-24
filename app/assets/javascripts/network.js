/*
 * This file is part of ZOUND live.
 *
 * Copyright 2014 Zengularity
 *
 * ZOUND live is free software: you can redistribute it and/or modify
 * it under the terms of the AFFERO GNU General Public License as published by
 * the Free Software Foundation.
 *
 * ZOUND live is distributed "AS-IS" AND WITHOUT ANY WARRANTY OF ANY KIND,
 * INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY,
 * NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. See
 * the AFFERO GNU General Public License for the complete license terms.
 *
 * You should have received a copy of the AFFERO GNU General Public License
 * along with ZOUND live.  If not, see <http://www.gnu.org/licenses/agpl-3.0.html>
 */
// FIXME: we need a zound.ui.NetworkNotification to listen to that model
zound.Network = Backbone.Model.extend({

  defaults: {
    initialRetryTime: 150+Math.floor(50*Math.round()), // randomness: try to not make everyone restart together
    retryMultiplicator: 1.8,
    maxTry: 10
  },

  initialize: function(){
    this.retryTime = this.get("initialRetryTime");
    this.tryNb = 0;
    this.socket = this.initSocket();
  },
  
  initSocket: function () {
    console.log("websocket connecting...");
    var socket = zound.Network.createWebSocketPromise(
      _.bind(this.onmessage, this), 
      _.bind(this.onerror, this), 
      _.bind(this.onclose, this)
    );
    socket.then(_.bind(function (ws) {
      console.log("websocket connected.", ws);
      this.retryTime = this.get("initialRetryTime");
      this.tryNb = 0;
      this.trigger("open");
    }, this));
    return socket;
  },

  onmessage: function (m) {
    var o = JSON.parse(m.data);
    // console.log("receive", o);
    // FIXME We should probably not filter this because it may create inconsistency,
    // backbone should solve for the us the "not retrigger unchanged .set"
    // [EDIT] this is not as trivial as I thought!
    if (o.user != window.CURRENT_USER.id) {
      this.trigger(o.type, o.data, o.user);
    }
  },

  onerror: function (e) {
    console.log("websocket error: ", e);
    this.trigger("error", e);
  },

  onclose: function (e) {
    console.log("websocket close: ", e);
    this.trigger("close", e);
    if (this.tryNb >= this.get("maxTry")) return;

    this.socket = Q.delay(this.retryTime).then(_.bind(function () {
      this.trigger("retry");
      return this.initSocket();
    }, this));

    this.retryTime *= this.get("retryMultiplicator");
    this.tryNb++;
  },

  send: function(type, data) {
    this.socket.then(function (ws) {
      // console.log("send", type, data);
      ws.send(JSON.stringify({
        user: CURRENT_USER.id,
        type: type,
        data: data
      }));
    });
  }

}, {
  createWebSocketPromise: function (onmessage, onerror, onclose) {
    return Q.fcall(function () {
      var d = Q.defer();
      var ws = new WebSocket(WEBSOCKET_ENDPOINT);
      ws.onopen = function () {
        d.resolve(ws);
      };
      ws.onclose = function (e) {
        d.reject(e);
        return onclose.apply(this, arguments);
      };
      ws.onmessage = onmessage;
      ws.onerror = onerror;
      return d.promise;
    });
  }
});

