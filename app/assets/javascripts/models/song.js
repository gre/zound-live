
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
      return Q.fcall(_.bind(module.init, module), this.ctx);
    }, this));

    allModulesReady.done(); // For now we don't do nothing with that promise..

    this.modules.on("add", _.bind(function (module) {
      Q.fcall(_.bind(module.init, module), this.ctx).done();
    }, this));
  },

  moduleIdCounter: 0,

  createModule: function (constructor, attributes) {
    var module = new constructor(attributes);
    module.id = this.moduleIdCounter++;
    this.modules.add(module);
    return module;
  },

  scheduleNote: function(lineNumber, time) {
    this.patterns.first().tracks.chain()
      .filter(function (track) {
        return track.isListenableFor(CURRENT_USER);
      })
      .each(function (track) {
      var slot = track.slots.at(lineNumber);
      var note = slot.get("note");
      if (note) {
        var module = slot.get("module");
        module.noteOn(note, this.ctx, time);
      }
    }, this);
  }

});
