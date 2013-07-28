

zound.models.Module = Backbone.Model.extend({
  defaults: {
    x: 100,
    y: 100,
    // FIXME: remove following data
    w: 70,
    h: 40
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
  },
  getDisplayId: function (module) {
    var name = ""+this.id;
    if (name.length>2) name=name.substring(name.length-2);
    else if (name.length==1) name = "0"+name;
    return name;
  },
  disconnect: function (outModule) {
    this.outputs.remove(outModule);
  },
  connect: function (outModule) {
    this.outputs.add(outModule);
  },
  canHaveInputs: function () {
    return true;
  },
  canHaveOutputs: function () {
    return true;
  },
  canPlayNote: function () {
    return false;
  },

  init: function (ctx) {
    // init with an AudioContext
  },

  // FIXME: leak!
  noteOn: function (note, ctx, time) {
    throw "noteOn not implemented";
  },

  // FIXME needed?
  noteOff: function () {
    throw "noteOff not implemented";
  },

  // FIXME: leak!
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
  },

  // Default plug and unplug functions are using this.input,
  // you have to set it in your init() implementation
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
    this.broadcastToOutputs(nodeInput, ctx);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});

