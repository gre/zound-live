
zound.models.PlayerController = Backbone.Model.extend({
  defaults: {
    length: 32,
    bpm: 125,
    playing: false,
    recording: false
  },

  initialize: function () {
    this.lookAhead = 25; // Call shedule every ms
    this.scheduleAhead = 0.1; // Audio schedule (sec)
    this.nextLineTime = 0;
    this.timerId = null;
    this.currentLine = 0;
  },

  setAudioContext: function (ctx) {
    this.ctx = ctx;
  },

  play: function () {
    this.trigger("play"); // play button pressed trigger, whatever if already playing
    if (this.get("playing")) return;
    var ctx = this.ctx;
    this.currentLine = 0;
    this.nextLineTime = ctx.currentTime;
    this.scheduler(ctx);
    this.set("playing", true);
  },

  stop: function () {
    this.trigger("stop"); // stop button pressed trigger, whatever if already playing
    if (!this.get("playing")) return;
    window.clearTimeout(this.timerId);
    this.set("recording", false);
    this.set("playing", false);
  },

  record: function () {
    this.play();
    this.set("recording", !this.get("recording"));
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


