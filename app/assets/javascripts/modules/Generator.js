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
(function (SynthModule) {

var GENERATOR_TYPES = ["sine","triangle","square","sawtooth"];

zound.modules.Generator = SynthModule.extend({
  initialize: function () {
    SynthModule.prototype.initialize.call(this);
    this.lastNote = null;
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "volume", min: 0, max: 100, title: "Volume", value: 50 }),
      new zound.models.ModulePropertySelect({ id: "type", values: GENERATOR_TYPES, title: "Type" }),
      new zound.models.ModulePropertyRange({ id: "attack", min: 0, max: 1000, title: "Attack", value: 10 }),
      new zound.models.ModulePropertyRange({ id: "decay", min: 0, max: 1000, title: "Decay", value: 200 }),
      new zound.models.ModulePropertyRange({ id: "release", min: 0, max: 4000, title: "Release", value: 200 }),
      new zound.models.ModulePropertyRange({ id: "sustain", min: 0, max: 100, title: "Sustain", value: 70 }),
      new zound.models.ModulePropertyRange({ id: "finetune", min: -100, max: 100, title: "Finetune", value: 0 }),
      new zound.models.ModulePropertyRange({ id: "notedetune", min: -12, max: 12, title: "Note Detune", value: 0 }),
      new zound.models.ModulePropertyRange({ id: "octavedetune", min: -2, max: 2, title: "Octave Detune", value: 0 }),
      new zound.models.ModulePropertyRange({ id: "glide", min: 0, max: 100, title: "Glide", value: 0 })
    ]);
    this._notes = [];

    this.properties.on("change:value", function (property, value) {
      var f = (function () {
        switch (property.id) {
          case "finetune":
          case "notedetune":
          case "octavedetune":
          return function (data) {
            data.osc.detune.value = this.getDetune();
          };
          // FIXME: other property to sync?
        }
      }());
      f && _.each(this._notes, f, this);
    }, this);
  },

  getDetune: function () {
    return this.properties.get("finetune").get("value") + 
      100*this.properties.get("notedetune").get("value") +
      1200*this.properties.get("octavedetune").get("value");
  },

  // FIXME: should probably give a frequency instead of a "note"
  noteOn: function (note, song, time) {
    var osc = song.ctx.createOscillator();
    var gain = song.ctx.createGain();
    osc.connect(gain);

    osc.type = GENERATOR_TYPES[this.properties.get("type").get("value")];
    osc.frequency.value = zound.AudioMath.noteToFrequency(note);
    osc.detune.value = this.getDetune();
    osc.start(time);

    gain.gain.value = this.properties.get("volume").getPercent();

    this.connect(gain, song);

    // Note envelope (Attack/Delay)
    var attackDuration = this.properties.get("attack").getValue() / 1000;
    var decayDuration = this.properties.get("decay").getValue() / 1000;
    var volume = this.properties.get("volume").getPercent();

    var data = {
      osc: osc,
      gain: gain,
      time: time,
      attackTime: time+attackDuration,
      decayTime: time+attackDuration+decayDuration
    };

    gain.gain.cancelScheduledValues(time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(volume, time+attackDuration);
    gain.gain.linearRampToValueAtTime(volume*this.properties.get("sustain").getPercent(), time+attackDuration+decayDuration);

    if (this.properties.get("sustain").getValue() === 0) {
      this.noteOff(data, song, time+attackDuration+decayDuration);
    }

    // Glide to note
    var glideDuration = this.properties.get("glide").getValue() / 100;
    if (glideDuration > 0 && this.lastNote) {
      osc.frequency.setValueAtTime(zound.AudioMath.noteToFrequency(this.lastNote), time);
      osc.frequency.linearRampToValueAtTime(zound.AudioMath.noteToFrequency(note), time + ((attackDuration + decayDuration) * glideDuration));
    }
    this.lastNote = note;

    song.execAtTime(_.bind(function () {
      this.trigger("noteOn");
    }, this), time);

    this._notes.push(data);
    return data;
  },

  noteOff: function (data, song, time) {
    var i = this._notes.indexOf(data);
    this._notes.splice(i, 1);
    var releaseTime = this.properties.get("release").getValue()/1000;
    var gain = data.gain.gain;
    gain.cancelScheduledValues(0);
    gain.setValueAtTime(gain.value, time);
    gain.linearRampToValueAtTime(0, time + releaseTime);
    data.osc.stop(time + releaseTime+1);
    song.execAtTime(_.bind(function () {
      this.disconnect(data.gain);
      this.trigger("noteOff");
    }, this), time+releaseTime+0.1);
  }
});

}(zound.models.SynthModule));
