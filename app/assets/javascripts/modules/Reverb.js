(function (EffectModule) {

zound.modules.Reverb = EffectModule.extend({
  
  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.pMix = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Mix", value: 20 });
    this.pTime = new zound.models.ModulePropertyRange({ min: 1, max: 100, title: "Time", value: 10 });
    this.pDecay = new zound.models.ModulePropertyRange({ min: 0, max: 50, title: "Decay", value: 2});
    this.properties.add([this.pMix, this.pTime, this.pDecay]);
  },

  init: function (song) {
    EffectModule.prototype.init.apply(this, arguments);
    this.input = song.ctx.createGain();
    this.output = song.ctx.createGain();
    this.drygain = song.ctx.createGain();
    this.wetgain = song.ctx.createGain();

    // Feedback delay into itself
    this.verb = song.ctx.createConvolver();
    this.buildImpulse(song);
    this.verb.connect(this.wetgain);

    this.input.connect(this.verb);
    this.input.connect(this.drygain);

    this.drygain.connect(this.output);
    this.wetgain.connect(this.output);

    this.updateMix();

    this.pTime.on("change", _.bind(this.buildImpulse, this, song));
    this.pDecay.on("change", _.bind(this.buildImpulse, this, song));
    this.pMix.on("change", _.bind(this.updateMix, this, song));
  },

  updateMix: function () {
    var wet = this.pMix.get("value") / 100;
    var dry = 1 - wet;

    this.wetgain.gain.value = wet;
    this.drygain.gain.value = dry;
  },

  buildImpulse: function (song) {
    // FIXME: need the audio context to rebuild the buffer.

    var ctx = song.ctx,
        rate = ctx.sampleRate,
        length = rate * (this.pTime.get("value") / 10), //seconds
        reverse = false,
        decay = (this.pTime.get("value") / 10),
        impulse = ctx.createBuffer(2, length, rate),
        impulseL = impulse.getChannelData(0),
        impulseR = impulse.getChannelData(1),
        n,
        i;
    for (i = 0; i < length; i++) {
      n = reverse ? length - i : i;
      impulseL[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
      impulseR[i] = (Math.random() * 2 - 1) * Math.pow(1 - n / length, decay);
    }
    this.verb.buffer = impulse;
  }
});

}(zound.models.EffectModule));
