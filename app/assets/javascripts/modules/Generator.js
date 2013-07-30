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
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 100 });
    this.pType = new zound.models.ModulePropertySelect({ values: GENERATOR_TYPES_NAME, title: "Type" });
    this.pAttack = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Attack", value: 10 });
    this.pDecay = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Decay", value: 200 });
    this.pRelease = new zound.models.ModulePropertyRange({ min: 0, max: 4000, title: "Release", value: 200 });
    this.pGlide = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Glide", value: 0 });
    this.properties.add([this.pVolume, this.pType, this.pAttack, this.pDecay, this.pRelease, this.pGlide]);
  },
  noteOn: function (note, ctx, time) {
    var osc = ctx.createOscillator();
    osc.type = GENERATOR_TYPES_OSCVALUE[this.pType.get("value")];
    osc.frequency.value = zound.AudioMath.noteToFrequency(note);
    osc.start(time);
    //osc.stop(time + 0.2);
    var gain = ctx.createGain();
    gain.gain.value = this.pVolume.getPercent();

    osc.connect(gain);
    this.broadcastToOutputs(gain, ctx);

    // Note envelope (Attack/Delay)
    var attackTime = this.pAttack.getValue() / 1000;
    var decayTime = this.pDecay.getValue() / 1000; // FIXME how to use the decay?

    gain.gain.cancelScheduledValues(time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(this.pVolume.getPercent(), time + attackTime);

    // Glide to note
    var glideTime = this.pGlide.getValue() / 100;
    if (glideTime > 0 && this.lastNote) {
      osc.frequency.setValueAtTime(zound.AudioMath.noteToFrequency(this.lastNote), time);
      osc.frequency.linearRampToValueAtTime(zound.AudioMath.noteToFrequency(note), time + ((attackTime + decayTime) * glideTime));
    }
    this.lastNote = note;
    return {
      osc: osc,
      gain: gain
    };

  },
  noteOff: function (nodes, ctx) {
    var time = ctx.currentTime;
    var releaseTime = this.pRelease.getValue()/1000;
    console.log(time, releaseTime);
    nodes.gain.gain.linearRampToValueAtTime(0, time + releaseTime);
    nodes.osc.stop(time + releaseTime);
  }
}, {
  GENERATOR_TYPES: GENERATOR_TYPES,
  GENERATOR_TYPES_NAME: GENERATOR_TYPES_NAME,
  GENERATOR_TYPES_OSCVALUE: GENERATOR_TYPES_OSCVALUE
});

}(zound.models.SynthModule));
