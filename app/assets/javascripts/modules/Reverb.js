/*
 * This file is part of ZOUND live.
 *
 * Copyright 2014 Zengularity
 *
 * ZOUND live is free software: you can redistribute it and/or modify
 * it under the terms of the AFFERO GNU General Public License as published by
 * the Free Software Foundation.
 *
 * ZOUND live is distributed "AS-IS" AND WITHOUT ANY WARRANTY OF ANY KIND,
 * INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY,
 * NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. See
 * the AFFERO GNU General Public License for the complete license terms.
 *
 * You should have received a copy of the AFFERO GNU General Public License
 * along with ZOUND live.  If not, see <http://www.gnu.org/licenses/agpl-3.0.html>
 */
(function (EffectModule) {

zound.modules.Reverb = EffectModule.extend({
  
  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "mix", min: 0, max: 100, title: "Mix", value: 20 }),
      new zound.models.ModulePropertyRange({ id: "time", min: 1, max: 100, title: "Time", value: 10 }),
      new zound.models.ModulePropertyRange({ id: "decay", min: 0, max: 50, title: "Decay", value: 2})
    ]);
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

    this.properties.get("time").on("change", _.bind(this.buildImpulse, this, song));
    this.properties.get("decay").on("change", _.bind(this.buildImpulse, this, song));
    this.properties.get("mix").on("change", _.bind(this.updateMix, this, song));
  },

  updateMix: function () {
    var wet = this.properties.get("mix").get("value") / 100;
    var dry = 1 - wet;

    this.wetgain.gain.value = wet;
    this.drygain.gain.value = dry;
  },

  buildImpulse: function (song) {
    // FIXME: need the audio context to rebuild the buffer.

    var ctx = song.ctx,
        rate = ctx.sampleRate,
        length = rate * (this.properties.get("time").get("value") / 10), //seconds
        reverse = false,
        decay = (this.properties.get("time").get("value") / 10),
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
