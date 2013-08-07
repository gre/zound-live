(function (EffectModule) {

zound.modules.Compressor = EffectModule.extend({

  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "threshold", min: -100, max: 0, title: "Threshold", value: -24 }),
      new zound.models.ModulePropertyRange({ id: "ratio", min: 1, max: 20, title: "Ratio", value: 12 }),
      new zound.models.ModulePropertyRange({ id: "gain", min: 0, max: 100, title: "Gain", value: 20 })
    ]);
  },

  init: function (song) {
    EffectModule.prototype.init.apply(this, arguments);

    this.compressor = song.ctx.createDynamicsCompressor();
    this.gain = song.ctx.createGain();
    this.compressor.connect(this.gain);

    this.input = this.compressor;
    this.output = this.gain;

    this.updateThreshold();
    this.updateRatio();
    this.updateGain();

    // we could improve that by listening to properties collection change :)
    this.properties.get("threshold").on("change", _.bind(this.updateThreshold, this));
    this.properties.get("ratio").on("change", _.bind(this.updateRatio, this));
    this.properties.get("gain").on("change", _.bind(this.updateGain, this));
  },

  updateThreshold: function () {
    this.compressor.threshold.value = this.properties.get("threshold").get("value");
  },

  updateRatio: function () {
    this.compressor.ratio.value = this.properties.get("ratio").get("value");
  },

  updateGain: function () {
    this.gain.gain.value = this.properties.get("gain").get("value") / 100;
  }

});

}(zound.models.EffectModule));
