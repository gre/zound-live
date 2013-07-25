
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

    var allModulesReady = Q.all(this.modules.map(function (module) {
      return Q.fcall(_.bind(module.init, module), this.ctx);
    }, this));

    allModulesReady.done(); // For now we don't do nothing with that promise..

    this.modules.on("add", _.bind(function (module) {
      Q.fcall(_.bind(module.init, module), this.ctx).done();
    }, this));
  },

  scheduleNote: function(lineNumber, time) {
    this.patterns.first().tracks.each(function (track) {
      var slot = track.slots.at(lineNumber);
      var note = slot.get("note");
      if (note) {
        var module = slot.get("module");
        module.noteOn(note, this.ctx, time);
      }
    }, this);
  }

});
