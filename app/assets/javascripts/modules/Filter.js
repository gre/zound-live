(function (Module) {

zound.modules.Filter = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Filter",
    color: "#358"
  }),
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pFrequency = new zound.models.ModulePropertyRange({ min: 10, max: 22050, title: "Frequency", value: 22050 });
    // FIXME: a lot of things to add here :)
    this.properties.add([this.pFrequency]);

  },
  init: function (ctx) {
    this.filter = ctx.createBiquadFilter();
    this.updateFrequency();
    this.pFrequency.on("change", _.bind(this.updateFrequency, this));
  },
  updateFrequency: function () {
    this.filter.frequency.value = this.pFrequency.get("value");
  },
  playThrough: function (nodeInput, ctx) {
    nodeInput.connect(this.filter);
    this.broadcastToOutputs(this.filter, ctx);
  }
}, { moduleName: "Output" });

}(zound.models.Module));


