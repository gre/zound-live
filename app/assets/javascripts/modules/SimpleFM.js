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

zound.modules.SimpleFM = SynthModule.extend({
  initialize: function () {
    SynthModule.prototype.initialize.call(this);
    this.lastNote = null;
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "volume", min: 0, max: 100, title: "Osc. Volume", value: 50 }),
      new zound.models.ModulePropertyRange({ id: "finetune", min: -100, max: 100, title: "Finetune", value: 0 }),
      new zound.models.ModulePropertyRange({ id: "m_volume", min: 0, max: 100, title: "Modulator", value: 50 }),

      new zound.models.ModulePropertyRange({ id: "freq_mul", min: 1, max: 20, title: "Osc. Freq. mul / 4", value: 4 }),
      new zound.models.ModulePropertyRange({ id: "m_freq_mul", min: 1, max: 20, title: "M. Freq. mul / 4", value: 1 }),

      new zound.models.ModulePropertyRange({ id: "attack", min: 0, max: 1000, title: "Attack", value: 10 }),
      new zound.models.ModulePropertyRange({ id: "decay", min: 0, max: 1000, title: "Decay", value: 200 }),
      new zound.models.ModulePropertyRange({ id: "release", min: 0, max: 4000, title: "Release", value: 200 }),
      new zound.models.ModulePropertyRange({ id: "sustain", min: 0, max: 100, title: "Sustain", value: 70 }),

      new zound.models.ModulePropertyRange({ id: "m_attack", min: 0, max: 1000, title: "M. Attack", value: 50 }),
      new zound.models.ModulePropertyRange({ id: "m_decay", min: 0, max: 1000, title: "M. Decay", value: 600 }),
      new zound.models.ModulePropertyRange({ id: "m_release", min: 0, max: 4000, title: "M. Release", value: 400 }),
      new zound.models.ModulePropertyRange({ id: "m_sustain", min: 0, max: 100, title: "M. Sustain", value: 20 })
    ]);
    this._notes = [];

    this.properties.on("change:value", function (property, value) {
      var f = (function () {
        switch (property.id) {
          case "finetune": return function (data) {
            data.osc.detune.value = this.getDetune();
          };
          case "freq_mul": return function (data) {
            data.osc.frequency.value = this.computeFreqMul(data.noteFreq, value);
          };
          case "m_freq_mul": return function (data) {
            data.modOsc.frequency.value = this.computeFreqMul(data.noteFreq, value);
          };
        }
      }());
      f && _.each(this._notes, f, this);
    }, this);
  },

  getDetune: function () {
    return this.properties.get("finetune").get("value");
  },

  computeFreqMul: function (freq, mul) {
    return freq * mul / 4;
  },

  envelope: function (gainNode, time, volume, attackDuration, decayDuration, sustain) {
    gainNode.gain.cancelScheduledValues(time);
    gainNode.gain.value = volume;
    gainNode.gain.setValueAtTime(0, time);
    gainNode.gain.linearRampToValueAtTime(volume, time + attackDuration);
    gainNode.gain.linearRampToValueAtTime(volume * sustain, time + attackDuration + decayDuration);
  },

  envelopeRelease: function (gainNode, time, releaseTime) {
    gainNode.gain.cancelScheduledValues(0);
    gainNode.gain.setValueAtTime(gainNode.gain.value, time);
    gainNode.gain.linearRampToValueAtTime(0, time + releaseTime);
  },

  getModAmplitude: function (noteFreq) {
    return this.properties.get("m_volume").getPercent() * noteFreq * this.properties.get("freq_mul").get("value");
  },

  noteOn: function (note, song, time) {
    var noteFreq = zound.AudioMath.noteToFrequency(note);
    var attackDuration = this.properties.get("attack").getValue() / 1000;
    var decayDuration = this.properties.get("decay").getValue() / 1000;
    var volume = this.properties.get("volume").getPercent();
    var sustain = this.properties.get("sustain").getPercent();

    // Init nodes
    var osc = song.ctx.createOscillator();
    osc.type = "sine";
    osc.detune.value = this.getDetune();
    osc.frequency.value = this.computeFreqMul(noteFreq, this.properties.get("freq_mul").get("value"));

    var gain = song.ctx.createGain();
    this.envelope(gain, time, volume, attackDuration, decayDuration, sustain);

    var modOsc = song.ctx.createOscillator();
    modOsc.type = "sine";
    modOsc.frequency.value = this.computeFreqMul(noteFreq, this.properties.get("m_freq_mul").get("value"));

    var modGain = song.ctx.createGain();
    this.envelope(modGain, time, 
        this.getModAmplitude(noteFreq),
        this.properties.get("m_attack").getValue() / 1000, 
        this.properties.get("m_decay").getValue() / 1000, 
        this.properties.get("m_sustain").getPercent());

    // Connect nodes
    modOsc.connect(modGain);
    modGain.connect(osc.frequency);
    osc.connect(gain);

    // Start nodes
    modOsc.start(time);
    osc.start(time);

    this.connect(gain, song);

    // Return data
    var data = {
      noteFreq: noteFreq,
      osc: osc,
      modOsc: modOsc,
      modGain: modGain,
      gain: gain,
      time: time,
      attackTime: time+attackDuration,
      decayTime: time+attackDuration+decayDuration
    };

    if (this.properties.get("sustain").getValue() === 0) {
      this.noteOff(data, song, time+attackDuration+decayDuration);
    }

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

    this.envelopeRelease(data.modGain, time, this.properties.get("m_release").getValue()/1000);
    this.envelopeRelease(data.gain, time, releaseTime);

    data.osc.stop(time + releaseTime+1);
    data.modOsc.stop(time + releaseTime+1);

    song.execAtTime(_.bind(function () {
      this.disconnect(data.gain);
      this.trigger("noteOff");
    }, this), time+releaseTime+0.1);
  }
});

}(zound.models.SynthModule));

