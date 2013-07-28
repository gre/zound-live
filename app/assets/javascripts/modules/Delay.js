(function (Module) {

zound.modules.Delay = Module.extend({
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pMix = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Mix", value: 20 });
    this.pTime = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Time", value: 24 });
    this.pFeedback = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Feedback", value: 40});
    this.properties.add([this.pMix, this.pTime, this.pFeedback]);
  },
  init: function (ctx) {
  	this.input = ctx.createGain();
    this.output = ctx.createGain();
  	this.drygain = ctx.createGain();
  	this.wetgain = ctx.createGain();

    // Feedback delay into itself
    this.delay = ctx.createDelay();
    this.feedbackGain = ctx.createGain();
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

    this.pTime.on("change", _.bind(this.updateTime, this));
    this.pFeedback.on("change", _.bind(this.updateFeedback, this));
    this.pMix.on("change", _.bind(this.updateMix, this));
  },
  updateTime: function () {
    this.delay.delayTime.value = this.pTime.get("value") / 100;
  },
  updateFeedback: function () {
  	this.feedbackGain.gain.value = this.pFeedback.get("value") / 100;
  },
  updateMix: function () {
	var wet = this.pMix.get("value") / 100;
	var dry = 1 - wet;

	this.wetgain.gain.value = wet;
	this.drygain.gain.value = dry;
  },
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
    this.broadcastToOutputs(this.output, ctx);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
  }
});

}(zound.models.Module));
