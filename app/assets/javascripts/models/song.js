
zound.models.Song = Backbone.Model.extend({
  defaults: {
    length: 32,
    bpm: 125
  },
  initialize: function () {
    this.patterns = new zound.models.Patterns();
    this.modules = new zound.models.Modules();

    this.lookAhead = 25; // Call shedule every ms
    this.scheduleAhead = 0.1; // Audio schedule (sec)
    this.nextLineTime = 0;
    this.playing = false;
    this.timerId = null;
    this.currentLine = 0;

    this.ctx = new webkitAudioContext();
    // Seems to be a weird bug in ctx if never start an osc == never start ctx.currentTime.
    var osc = this.ctx.createOscillator();
    osc.start(this.ctx.currentTime);
    osc.stop(this.ctx.currentTime + 0.001);
  },

  play: function () {
    this.playing = true;
    this.currentLine = 0;
    this.nextLineTime = this.ctx.currentTime;
    this.scheduler();
  },

  stop: function () {
    this.playing = false;
    window.clearTimeout(this.timerId);
  },

  scheduler: function () {
    while (this.nextLineTime < this.ctx.currentTime + this.scheduleAhead) {
      this.scheduleNote(this.currentLine, this.nextLineTime);
      this.nextNote();
    }
    var self = this;

    this.timerId = window.setTimeout(function () {
      self.scheduler();
    }, this.lookAhead);
  },

  nextNote: function() {
    var pattern = this.patterns.models[0],
    secondsPerBeat = 60.0 / this.get("bpm");
    this.nextLineTime = this.nextLineTime + 0.25 * secondsPerBeat;

    this.currentLine = this.currentLine + 1;
    if (this.currentLine == pattern.get("length")) {
      this.currentLine = 0;
    }
  },

  scheduleNote: function(lineNumber, time) {
    var pattern = this.patterns.models[0],
    notes = [];

    pattern.tracks.each(function (track) {
      var slot = track.slots.at(lineNumber);
      var note = slot.get("note");
      if (note) {
        var module = slot.get("module");
        module.noteOn(note, this.ctx, time);
      }
    }, this);
  }

});
