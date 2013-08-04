(function (Module) {

zound.modules.Output = Module.extend({
  canPlugTo: function (out) {
    return false;
  },
  canHaveOutputs: function () {
    return false;
  },
  canPlayNote: function () {
    return false;
  },
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, value: 100, title: "Volume" })
  },
  init: function (ctx) {
    Module.prototype.init.apply(this, arguments);
    this.gain = ctx.createGain();
    this.gain.connect(ctx.destination);
    this.updateGain();
    this.pVolume.on("change", _.bind(this.updateGain, this));
    this.input = this.gain;
  },
  updateGain: function () {
    this.gain.gain.value = this.pVolume.getPercent();
  },
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
  }
});

}(zound.models.Module));

