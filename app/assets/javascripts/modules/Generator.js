(function (SynthModule) {

var OscillatorNode = zound.dummyAudioContext.createOscillator();

var GENERATOR_TYPES = [
  ["sine", OscillatorNode.SINE],
  ["triangle", OscillatorNode.TRIANGLE],
  ["square", OscillatorNode.SQUARE],
  ["saw", OscillatorNode.SAWTOOTH]
];
var GENERATOR_TYPES_NAME = _.pluck(GENERATOR_TYPES, 0);
var GENERATOR_TYPES_OSCVALUE = _.pluck(GENERATOR_TYPES, 1);

zound.modules.Generator = SynthModule.extend({
  initialize: function () {
    SynthModule.prototype.initialize.call(this);
    this.lastNote = null;
    this.properties.add([
      this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 50 }),
      this.pType = new zound.models.ModulePropertySelect({ values: GENERATOR_TYPES_NAME, title: "Type" }),
      this.pAttack = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Attack", value: 10 }),
      this.pDecay = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Decay", value: 200 }),
      this.pRelease = new zound.models.ModulePropertyRange({ min: 0, max: 4000, title: "Release", value: 200 }),
      this.pDecayVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Decay Volume", value: 70 }),
      this.pSustain = new zound.models.ModulePropertySelect({ values: [ "off", "on" ], title: "Sustain", value: 1 }),
      this.pGlide = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Glide", value: 0 })
    ]);
  },
  noteOn: function (note, song, time) {
    var osc = song.ctx.createOscillator();
    var gain = song.ctx.createGain();
    osc.connect(gain);

    osc.type = GENERATOR_TYPES_OSCVALUE[this.pType.get("value")];
    osc.frequency.value = zound.AudioMath.noteToFrequency(note);
    osc.start(time);

    gain.gain.value = this.pVolume.getPercent();

    this.connect(gain, song);

    // Note envelope (Attack/Delay)
    var attackDuration = this.pAttack.getValue() / 1000;
    var decayDuration = this.pDecay.getValue() / 1000;
    var volume = this.pVolume.getPercent();

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
    gain.gain.linearRampToValueAtTime(volume*this.pDecayVolume.getPercent(), time+attackDuration+decayDuration);

    if (!this.pSustain.getValue()) {
      this.noteOff(data, song, time+attackDuration+decayDuration);
    }

    // Glide to note
    var glideDuration = this.pGlide.getValue() / 100;
    if (glideDuration > 0 && this.lastNote) {
      osc.frequency.setValueAtTime(zound.AudioMath.noteToFrequency(this.lastNote), time);
      osc.frequency.linearRampToValueAtTime(zound.AudioMath.noteToFrequency(note), time + ((attackDuration + decayDuration) * glideDuration));
    }
    this.lastNote = note;

    song.execAtTime(_.bind(function () {
      this.trigger("noteOn");
    }, this), time);
    return data;
  },

  noteOff: function (data, song, time) {
    var releaseTime = this.pRelease.getValue()/1000;
    var gain = data.gain.gain;
    gain.cancelScheduledValues(0);
    gain.setValueAtTime(gain.value, time);
    gain.linearRampToValueAtTime(0, time + releaseTime);
    data.osc.stop(time + releaseTime);
    song.execAtTime(_.bind(function () {
      this.disconnect(data.gain);
      this.refreshAnalyser();
      this.trigger("noteOff");
    }, this), time+releaseTime);
  }
}, {
  GENERATOR_TYPES: GENERATOR_TYPES,
  GENERATOR_TYPES_NAME: GENERATOR_TYPES_NAME,
  GENERATOR_TYPES_OSCVALUE: GENERATOR_TYPES_OSCVALUE
});

}(zound.models.SynthModule));
