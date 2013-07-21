

zound.models.Module = Backbone.Model.extend({
  defaults: {
    x: 0,
    y: 0,
    w: 70,
    h: 40,
    title: "Untitled"
  },
  initialize: function () {
    this.outputs = new zound.models.Modules();
    this.properties = new zound.models.ModuleProperties();
  },
  disconnect: function (outModule) {
    this.outputs.remove(outModule);
    console.log("disconnect should be overrided for module "+this.constructor.moduleName);
  },
  connect: function (outModule) {
    this.outputs.add(outModule);
    console.log("connect should be overrided for module "+this.constructor.moduleName);
  },
  canHaveInputs: function () {
    return true;
  },
  canHaveOutputs: function () {
    return true;
  },
  canPlayNote: function () {
    return false;
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});

