(function (Module) {

var GENERATOR_TYPES = [
  ["sine", OscillatorNode.SINE],
  ["triangle", OscillatorNode.TRIANGLE],
  ["square", OscillatorNode.SQUARE],
  ["saw", OscillatorNode.SAWTOOTH]
];
var GENERATOR_TYPES_NAME = _.pluck(GENERATOR_TYPES, 0);
var GENERATOR_TYPES_OSCVALUE = _.pluck(GENERATOR_TYPES, 1);

zound.modules.Generator = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Generator",
    color: "#622"
  }),
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 100 });
    this.pType = new zound.models.ModulePropertySelect({ values: GENERATOR_TYPES_NAME, title: "Type" });
    this.pAttack = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Attack", value: 10 });
    this.pDecay = new zound.models.ModulePropertyRange({ min: 0, max: 1000, title: "Decay", value: 200 });
    this.properties.add([this.pVolume, this.pType, this.pAttack, this.pDecay]);
  },
  canHaveInputs: function () {
    return false;
  },
  canPlayNote: function () {
    return true;
  },
  noteOn: function (note, ctx, time) {
    var osc = ctx.createOscillator();
    osc.type = GENERATOR_TYPES_OSCVALUE[this.pType.get("value")];
    osc.frequency.value = zound.AudioMath.noteToFrequency(note);
    osc.start(time);
    osc.stop(time + 0.2);
    var gain = ctx.createGain();
    gain.gain.value = this.pVolume.getPercent();

    osc.connect(gain);
    this.broadcastToOutputs(gain, ctx);

    // Handle envelope
    gain.gain.cancelScheduledValues(time);
    gain.gain.setValueAtTime(0, time);
    gain.gain.linearRampToValueAtTime(this.pVolume.getPercent(), time + (this.pAttack.getValue() / 1000));
    gain.gain.linearRampToValueAtTime(0, time + (this.pAttack.getValue() / 1000) + (this.pDecay.getValue() / 1000));
  },
  noteOff: function () {
    // needed?
  }
}, {
  moduleName: "Generator",
  GENERATOR_TYPES: GENERATOR_TYPES,
  GENERATOR_TYPES_NAME: GENERATOR_TYPES_NAME,
  GENERATOR_TYPES_OSCVALUE: GENERATOR_TYPES_OSCVALUE
});

}(zound.models.Module));
