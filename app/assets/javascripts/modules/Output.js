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
  init: function (song) {
    Module.prototype.init.apply(this, arguments);
    this.gain = song.ctx.createGain();
    this.gain.connect(song.ctx.destination);
    this.updateGain();
    this.pVolume.on("change", _.bind(this.updateGain, this));
    this.input = this.gain;
    this.output = this.gain;
  },
  updateGain: function () {
    this.gain.gain.value = this.pVolume.getPercent();
  },
  plugInput: function (nodeInput, song) {
    nodeInput.connect(this.input);
    this.connect(this.output, song);
  },
  unplugInput: function (nodeInput, song) {
    nodeInput.disconnect(this.input);
    this.disconnect(this.output, song);
  }
});

}(zound.models.Module));

