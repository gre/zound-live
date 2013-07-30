

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
    if(this.canPlayNote) {
      var noteOn = this.noteOn,
          me = this;
      this.noteOn = function(note, ctx, time){
        setTimeout(function(){
          me.trigger('note');
        }, time - Date.now());
        noteOn.apply(me, arguments);
      };
    }

  },
  getDisplayId: function () {
    zound.models.Module.idToText(this.id);
  },
  // Add an output module
  connect: function (outModule) {
    this.outputs.add(outModule);
  },
  // Remove an output module
  disconnect: function (outModule) {
    this.outputs.remove(outModule);
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

  init: function (ctx) {
    // init with an AudioContext
  },

  // FIXME: leak?
  broadcastToOutputs: function (node, ctx) {
    this.outputs.each(function (outModule) {
      outModule.plugInput(node, ctx);
    });
    this.outputs.on("add", function (outModule) {
      outModule.plugInput(node, ctx);
    });
    this.outputs.on("remove", function (outModule) {
      outModule.unplugInput(node, ctx);
    });
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

  // FIXME needed?
  noteOff: function () {
    throw "noteOff not implemented";
  }
});

zound.models.EffectModule = zound.models.Module.extend({
  // Default plug and unplug functions are using this.input and this.output,
  // you have to set it in your init() implementation
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
    this.broadcastToOutputs(this.output, ctx);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});
