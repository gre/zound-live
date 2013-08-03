(function (EffectModule) {

zound.modules.Compressor = EffectModule.extend({

  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.pThreshold = new zound.models.ModulePropertyRange({ min: -100, max: 0, title: "Threshold", value: -24 });
    this.pRatio = new zound.models.ModulePropertyRange({ min: 1, max: 20, title: "Ratio", value: 12 });
    this.pGain = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Gain", value: 20 });
    this.properties.add([this.pThreshold, this.pRatio, this.pGain]);
  },

  init: function (ctx) {

    this.compressor = ctx.createDynamicsCompressor();
    this.gain = ctx.createGain();
    this.compressor.connect(this.gain);

    this.input = this.compressor;
    this.output = this.gain;

    this.updateThreshold();
    this.updateRatio();
    this.updateGain();

    this.pThreshold.on("change", _.bind(this.updateThreshold, this));
    this.pRatio.on("change", _.bind(this.updateRatio, this));
    this.pGain.on("change", _.bind(this.updateGain, this));
  },

  updateThreshold: function () {

    this.compressor.threshold.value = this.pThreshold.get("value");

  },

  updateRatio: function () {

    this.compressor.ratio.value = this.pRatio.get("value");

  },

  updateGain: function () {

    this.gain.gain.value = this.pGain.get("value") / 100;

  }

});

}(zound.models.EffectModule));
