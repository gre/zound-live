
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
    this.addModule(module);
    return module;
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

  scheduleNote: function(lineNumber, time) {
    this.patterns.first().tracks.chain()
      .filter(function (track) {
        return track.isListenableFor(CURRENT_USER);
      })
      .each(function (track) {
      var slot = track.slots.at(lineNumber);
      var note = slot.get("note");
      if (note) {
        var moduleId = slot.get("module");
        var module = this.modules.get(moduleId);
        if (module) {
          module.noteOn(note, this.ctx, time);
        }
      }
    }, this);
  }

});
