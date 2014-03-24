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

zound.modules.Delay = EffectModule.extend({
  
  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "mix", min: 0, max: 100, title: "Mix", value: 20 }),
      new zound.models.ModulePropertyRange({ id: "time", min: 0, max: 100, curve: "quad", round: false, title: "Time", value: 24 }),
      new zound.models.ModulePropertyRange({ id: "feedback", min: 0, max: 100, title: "Feedback", value: 40})
    ]);
  },

  init: function (song) {
    EffectModule.prototype.init.apply(this, arguments);
    this.input = song.ctx.createGain();
    this.output = song.ctx.createGain();
    this.drygain = song.ctx.createGain();
    this.wetgain = song.ctx.createGain();

    // Feedback delay into itself
    this.delay = song.ctx.createDelay();
    this.feedbackGain = song.ctx.createGain();
    this.feedbackGain.gain.value = 0;
    this.feedbackGain.connect(this.delay);
    this.delay.connect(this.feedbackGain);
    this.delay.connect(this.wetgain);

    this.input.connect(this.delay);
    this.input.connect(this.drygain);

    this.drygain.connect(this.output);
    this.wetgain.connect(this.output);

    this.updateTime();
    this.updateFeedback();
    this.updateMix();

    this.properties.get("time").on("change", _.bind(this.updateTime, this));
    this.properties.get("feedback").on("change", _.bind(this.updateFeedback, this));
    this.properties.get("mix").on("change", _.bind(this.updateMix, this));
  },

  updateTime: function () {
    this.delay.delayTime.value = this.properties.get("time").get("value") / 100;
  },
  
  updateFeedback: function () {
    this.feedbackGain.gain.value = this.properties.get("feedback").get("value") / 100;
  },
  
  updateMix: function () {
    var wet = this.properties.get("mix").get("value") / 100;
    var dry = 1 - wet;

    this.wetgain.gain.value = wet;
    this.drygain.gain.value = dry;
  }
});

}(zound.models.EffectModule));
