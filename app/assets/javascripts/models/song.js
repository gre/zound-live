/*
 * This file is part of ZOUND live.
 *
 * Copyright 2014 Zengularity
 *
 * ZOUND live is free software: you can redistribute it and/or modify
 * it under the terms of the AFFERO GNU General Public License as published by
 * the Free Software Foundation.
 *
 * ZOUND live is distributed "AS-IS" AND WITHOUT ANY WARRANTY OF ANY KIND,
 * INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY,
 * NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. See
 * the AFFERO GNU General Public License for the complete license terms.
 *
 * You should have received a copy of the AFFERO GNU General Public License
 * along with ZOUND live.  If not, see <http://www.gnu.org/licenses/agpl-3.0.html>
 */

zound.models.Song = Backbone.Model.extend({
  defaults: {
    length: 32, // FIXME does this make sense?
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

  execAtTime: function (f, t) {
    setTimeout(f, 1000*(t-this.ctx.currentTime));
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
      var slot = track.slots.get(lineNumber);
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

}, {
  fromJSON: function (json) {
    // Create a song
    var song = new zound.models.Song({
      id: json.id,
      bpm: 125
    });

    // Create all modules
    var modules = _.map(json.modules, function (m) {
      var properties = m.properties; delete m.properties;
      var outputs = m.outputs; delete m.outputs;
      var clazz = m.clazz; delete m.clazz;
      var module = new zound.modules[clazz](m);
      return {
        model: module,
        properties: properties,
        outputs: outputs
      };
    });

    // Plug outputs
    _.each(modules, function (m) {
      m.model.outputs.add(_.map(m.outputs, function (id) {
        return _.find(modules, function (m) {
          return m.model.id === id;
        }).model;
      }));
    });

    // Set all properties
    _.each(modules, function (m) {
      _.each(m.properties, function (value, pid) {
        m.model.properties.get(pid).set("value", value);
      });
    });

    // Add all modules
    song.modules.add(_.pluck(modules, "model"));
    
    // Add all patterns, tracks, notes
    song.patterns.add(_.map(json.patterns, function (p) {
      var pattern = new zound.models.Pattern({
        id: p.id,
        length: p.length
      });
      pattern.tracks.add(_.map(p.tracks, function (t) {
        var track = new zound.models.Track({
          id: t.id,
          length: p.length
        });
        _.each(t.notes, function (n) {
          track.slots.get(n.id).set(n);
        });
        return track;
      }));
      return pattern;
    }));

    return song;
  }
});
