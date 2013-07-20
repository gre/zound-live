

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});

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
  connect: function (outModule) {
    this.outputs.add(outModule);
    console.log("connect should be overrided for module "+this.constructor.moduleName);
  }
});
