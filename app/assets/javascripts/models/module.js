

zound.models.Module = Backbone.Model.extend({
  defaults: {
    x: 100,
    y: 100
  },
  initialize: function (opts) {
    // FIXME: can't find a better DRY way :'( - this won't support modules inheritance
    for (var m in zound.modules) {
      if (this instanceof zound.modules[m]) {
        this.set("moduleName", m);
      }
    }
    if (!this.get("title")) this.set("title", this.constructor.moduleName+this.id);
    this.outputs = new zound.models.Modules();
    this.properties = new zound.models.ModuleProperties();

    // XXX: trigger 'note' when a note is played by the module
    if(this.canPlayNote()) {
      var noteOn = this.noteOn,
          me = this;
      this.noteOn = function (note, ctx, time) {
        setTimeout(function(){
          me.trigger('note');
        }, time - Date.now());
        return noteOn.apply(me, arguments);
      };
    }

    this.samplesLength = 256;
    this.waveData = new Uint8Array(this.samplesLength);
  },
  init: function (ctx) { // <- FIXME this will be a "song" model parameter instead.
    // init with an AudioContext
    this.analyserNode = ctx.createAnalyser();
    setInterval(_.bind(function () {
      /*
      this.waveData = d3.range(this.samplesLength).map(function (i) {
        return Math.random()*2-1;
      });
      */
      //console.log(this.waveData);
      this.analyserNode.getByteTimeDomainData(this.waveData);
      this.trigger("waveData", this.waveData);
    }, this), 30);
  },

  getDisplayId: function () {
    return zound.models.Module.idToText(this.id);
  },
  // Can the module ever have outputs?
  canHaveOutputs: function (module) {
    return true;
  },
  // Can I play notes from that module?
  canPlayNote: function () {
    return "noteOn" in this; // duck typing by default
  },
  // Can I plug that module to another one?
  canConnectTo: function (module) {
    return "plugInput" in module; // duck typing by default
  },

  connect: function (node, ctx) {
    var plugInputF = function (outModule) {
      outModule.plugInput(node, ctx);
    };
    var unplugInputF = function (outModule) {
      outModule.unplugInput(node, ctx);
    };
    this.outputs.each(plugInputF);
    this.outputs.on("add", plugInputF);
    this.outputs.on("remove", unplugInputF);
    node.connect(this.analyserNode);
    return {
      node: node,
      plugInputF: plugInputF,
      unplugInputF: unplugInputF
    };
  },

  disconnect: function (connectData) {
    this.outputs.off("add", connectData.plugInputF);
    this.outputs.off("remove", connectData.unplugInputF);
    //connectData.node.disconnect(this.analyserNode);
  }

}, {
  idToText: function (id) {
    var name = ""+id;
    if (name.length>2) name=name.substring(name.length-2);
    else if (name.length==1) name = "0"+name;
    return name;
  }
});

zound.models.SynthModule = zound.models.Module.extend({
  // FIXME: leak?
  noteOn: function (note, ctx, time) {
    throw "noteOn not implemented";
  },

  noteOff: function (noteData, ctx, time) {
    // noteData is the value returned by the noteOn function
  }
});

zound.models.EffectModule = zound.models.Module.extend({
  // Default plug and unplug functions are using this.input and this.output,
  // you have to set it in your init() implementation
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
    this.connect(this.output, ctx);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
    this.disconnect(this.output, ctx);
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});
