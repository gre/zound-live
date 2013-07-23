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
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume" });
    this.pType = new zound.models.ModulePropertySelect({ values: GENERATOR_TYPES_NAME, title: "Type" });
    this.properties.add([this.pVolume, this.pType]);
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
    osc.connect(ctx.destination);
    osc.frequency.value = zound.AudioMath.noteToFrequency(note);
    osc.start(time);
    osc.stop(time + 0.1);
  },
  noteOff: function () {
    // FIXME
  }
}, { moduleName: "Generator" });

}(zound.models.Module));
