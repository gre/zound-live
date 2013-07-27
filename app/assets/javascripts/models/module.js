

zound.models.Module = Backbone.Model.extend({
  defaults: {
    x: 0,
    y: 0,
    w: 70,
    h: 40,
    title: "Untitled",
    color: "#000",
    isSelected: false
  },
  initialize: function () {
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
  noteOn: function (note, ctx, time) {
    throw "noteOn not implemented";
  },

  // FIXME needed?
  noteOff: function () {
    throw "noteOff not implemented";
  },

  broadcastToOutputs: function (node, ctx) {
    this.outputs.each(function (outModule) {
      outModule.playThrough(node, ctx);
    });
  },
  playThrough: function (nodeInput, ctx) {
    // do nothing but connect to outputs
    this.broadcastToOutputs(nodeInput, ctx);
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});

