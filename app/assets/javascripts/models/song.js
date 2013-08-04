
zound.models.Song = Backbone.Model.extend({
  defaults: {
    length: 32,
    bpm: 125
  },
  initialize: function () {
    this.patterns = new zound.models.Patterns();
    this.modules = new zound.models.Modules();

    this.ctx = zound.createAudioContext();

    var allModulesReady = Q.all(this.modules.map(function (module) {
      return Q.fcall(_.bind(module.init, module), this);
    }, this));

    allModulesReady.done(); // For now we don't do nothing with that promise..

    this.modules.on("add", _.bind(function (module) {
      Q.fcall(_.bind(module.init, module), this).done();
    }, this));
  },

  moduleIdCounter: 0,

  createModule: function (constructor, attributes) {
    var module = new constructor(attributes);
    this.addModule(module);
    return module;
  },

  execAtTime: function (f, t) {
    setTimeout(f, 1000*(t-this.ctx.currentTime));
  },

  addModule: function (module) {
    module.set("id", this.moduleIdCounter++);
    this.modules.add(module);
  },

  removeModule: function (moduleId) {
    if (this.modules.get(moduleId) instanceof zound.modules.Output) return;
    this.modules.remove(moduleId);
    this.modules.each(function (module) {
      module.outputs.remove(moduleId);
    });
  },

  holdingNotes: [],

  releaseHoldingNotes: function () {
    _.each(this.holdingNotes, function (note) {
      note.module.noteOff(note.data, this, this.ctx.currentTime);
    }, this);
    this.holdingNotes = [];
  },

  noteOffForTrack: function (track, time) {
    this.holdingNotes = _.filter(this.holdingNotes, function (note) {
      if (track !== note.track) return true;
      note.module.noteOff(note.data, this, time);
    }, this);
  },

  scheduleNote: function(lineNumber, time) {
    if (lineNumber === 0) {
      this.patterns.first().tracks.each(function (track) {
        this.noteOffForTrack(track, time);
      }, this);
    }
    this.patterns.first().tracks.chain()
      .filter(function (track) {
        return track.isListenableFor(CURRENT_USER);
      })
      .each(function (track) {
      var slot = track.slots.at(lineNumber);
      switch (slot.get("typ")) {
      case "note":
        var note = slot.get("note");
        var moduleId = slot.get("module");
        var module = this.modules.get(moduleId);
        if (module) {
          this.noteOffForTrack(track, time);
          var data = module.noteOn(note, this, time);
          this.holdingNotes.push({
            data: data,
            module: module,
            track: track
          });
        }
        break;
      case "off":
        this.noteOffForTrack(track, time);
        break;
      }
    }, this);
  }

});
