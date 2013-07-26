
// FIXME: PlayerController is only a play/stop controller which .trigger("tick", numline) each tick

zound.models.PlayerController = Backbone.Model.extend({
  defaults: {
    length: 32,
    bpm: 125
  },

  initialize: function () {
    this.lookAhead = 25; // Call shedule every ms
    this.scheduleAhead = 0.1; // Audio schedule (sec)
    this.nextLineTime = 0;
    this.playing = false;
    this.timerId = null;
    this.currentLine = 0;
  },

  setAudioContext: function (ctx) {
    this.ctx = ctx;
  },

  play: function () {
    if (this.playing) return;
    var ctx = this.ctx;
    this.playing = true;
    this.currentLine = 0;
    this.nextLineTime = ctx.currentTime;
    this.scheduler(ctx);
    this.trigger("play");
  },

  stop: function () {
    if (!this.playing) return;
    this.recording = this.playing = false;
    window.clearTimeout(this.timerId);
    this.trigger("stop");
  },

  record: function () {
    this.play();
    this.recording = true;
    this.trigger("record");
  },

  scheduler: function (ctx) {
    while (this.nextLineTime < ctx.currentTime + this.scheduleAhead) {
      this.trigger("tick", this.currentLine, this.nextLineTime);
      this.nextLine();
    }
    this.timerId = window.setTimeout(_.bind(this.scheduler, this, ctx), this.lookAhead);
  },

  nextLine: function () {
    var secondsPerBeat = 60.0 / this.get("bpm");
    this.nextLineTime = this.nextLineTime + 0.25 * secondsPerBeat;
    this.currentLine = this.currentLine+1 >= this.get("length") ? 0 : this.currentLine+1;
  }
});


