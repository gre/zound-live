(function (models, modules, ui) {

  var HOLDING_USER_NOTES = {};

  //~~~ MODELS

  // Init every models
  var network = new zound.Network();
  var users = new zound.models.Users([ window.CURRENT_USER ]);

  var song = song_sample1();
  window._song = song; // for DEBUG only
  var pattern = song.patterns.first();

  var midiController = new models.MIDIController();

  var keyboardController = new models.KeyboardController(_.extend({
    user: CURRENT_USER
  }, models.KeyboardController[window.KEYBOARD_LAYOUT+"config"]));

  var playerController = new models.PlayerController({
    length: song.get("length"),
    bpm: song.get("bpm")
  });
  playerController.setAudioContext(song.ctx);

  var availableModules = new models.Modules([
    new modules.Generator({ title: "Generator" }),
    new modules.Drum({ title: "Drum" }),
    new modules.MultiSynth({ title: "MultiSynth" }),
    new modules.Filter({ title: "Filter" }),
    new modules.Delay({ title: "Delay" }),
    new modules.Reverb({ title: "Reverb" }),
    new modules.Compressor({ title: "Compressor" })
  ]);

  // Bind models together
  song.on("change:length", function (song, length) {
    playerController.set("length", length);
  });
  song.on("change:bpm", function (song, bpm) {
    playerController.set("bpm", bpm);
  });
  $(window).blur(function (e) {
    playerController.stop();
  });

  availableModules.on("selectModule", function (module) {
    var m = module.clone();
    var title = m.get("title");
    if (title.length > 6) title = title.substring(0,5)+".";
    m.set("title", title+song.moduleIdCounter);
    song.addModule(m);
  });

  users.on("change:slot", function (user, value) {
    var previous = user.previous("slot");
    if (previous) {
      tracker.getSlot(previous.track, previous.slot).setUserSelect(null);
    }
    if (value) {
      tracker.getSlot(value.track, value.slot).setUserSelect(user.id);
    }
  });

  playerController.on("stop", function (model, playing) {
    if (!playing) {
      song.releaseHoldingNotes();
      for (note in HOLDING_USER_NOTES) {
        HOLDING_USER_NOTES[note].module.noteOff(HOLDING_USER_NOTES[note].data, song.ctx, song.ctx.currentTime);
      }
      HOLDING_USER_NOTES = {};
    }
  });
  playerController.on("change:recording", function (model, recording) {
    if (recording && !CURRENT_USER.get("slot"))
      CURRENT_USER.set("slot", { track: 0, slot: 0 });
  });
  playerController.on("tick", function (lineNumber, time) {
    song.scheduleNote(lineNumber, time);
    if(playerController.get("recording"))
      CURRENT_USER.moveTo(lineNumber);
  });

  var handleNoteOn = function (note, velocity) {
    var module = song.modules.get(CURRENT_USER.get("module"));
    var slot = CURRENT_USER.get("slot");

    if (module && module.canPlayNote()) {
      var data = module.noteOn(note, song.ctx, song.ctx.currentTime);
      if (HOLDING_USER_NOTES[note]) {
        HOLDING_USER_NOTES[note].module.noteOff(HOLDING_USER_NOTES[note].data, song.ctx, song.ctx.currentTime);
      }
      HOLDING_USER_NOTES[note] = { data: data, module: module };
    }

    if (module && module.canPlayNote() && slot) {
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      slotModel.setNote(note, module.id);
      CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"), pattern.tracks.size(), pattern.get("length"));
    }
  };

  var handleNoteOff = function (note) {
    if (HOLDING_USER_NOTES[note]) {
      HOLDING_USER_NOTES[note].module.noteOff(HOLDING_USER_NOTES[note].data, song.ctx, song.ctx.currentTime);
      delete HOLDING_USER_NOTES[note];
    }
    var module = song.modules.get(CURRENT_USER.get("module"));
    var slot = CURRENT_USER.get("slot");
    if (module && module.canPlayNote() && slot) {
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      if (slotModel.get("typ")==="blank")
        slotModel.setOff();
    }
  };

  midiController.on({
    "noteOn": handleNoteOn,
    "noteOff": handleNoteOff
  });

  keyboardController.on({
    "noteOn": handleNoteOn,
    "noteOff": handleNoteOff,
    "tracker-off": function () {
      var slot = CURRENT_USER.get("slot");
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      slotModel.setOff();
      CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"), pattern.tracks.size(), pattern.get("length"));
    },
    "tracker-move": function (incrX, incrY) {
      CURRENT_USER.moveTrackerSelection(incrX, incrY, pattern.tracks.size(), pattern.get("length"));
    },
    "tracker-backspace": function () {
      var slot = CURRENT_USER.get("slot");
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      slotModel.setBlank();
      CURRENT_USER.moveTrackerSelection(0, -1, pattern.tracks.size(), pattern.get("length"));
    },
    "tracker-delete": function () {
      var slot = CURRENT_USER.get("slot");
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      slotModel.setBlank();
      CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"), pattern.tracks.size(), pattern.get("length"));
    },
    "unselect": function () {
      CURRENT_USER.set("slot", null);
    },
    "play-pause": function () {
      if (!playerController.get("playing"))
        playerController.play();
      else
        playerController.stop();
    },
    "module-delete": function () {
      var moduleId = CURRENT_USER.get("module");
      song.removeModule(moduleId);
    }
  });


  //~~~ VIEWS

  // init views

  var midiControllerNotification = new ui.MIDIControllerNotification({
    model: midiController
  });
  $("#midiNotification").append(midiControllerNotification.el);

  var nodeEditor = new ui.NodeEditor({
    model: song,
    el: '#node-editor'
  });

  var tracker = new zound.ui.Tracker({
    model: pattern
  });
  $("#tracker").append(tracker.el);

  var trackerIncrement = new zound.ui.TrackerIncrement({
    model: CURRENT_USER,
    id: "tracker-increment"
  });
  $('#tracker').append(trackerIncrement.el);

  var volumeControl = new ui.VolumeControl({
    model: song.modules.get(0).pVolume
  });
  $('#toolbar').append(volumeControl.el);

  var player = new ui.Player({
    model: playerController
  });
  $('#toolbar').append(player.el);

  var moduleChooser = new ui.ModulesChooser({
    model: availableModules
  });
  $('#module-collection').append(moduleChooser.el);

  // bind views

  var currentPropertiesEditor;
  CURRENT_USER.on("change:module", function (user, moduleId) {
    var module = song.modules.get(moduleId);
    if (currentPropertiesEditor) {
      currentPropertiesEditor.remove();
    }
    currentPropertiesEditor = new zound.ui.ModulePropertiesEditor({
      model: module
    });
    $('#module-properties').append(currentPropertiesEditor.el);
  });

  (function () {
    var m = song.modules.find(function (module) {
      return module instanceof zound.models.SynthModule;
    });
    if (m) {
      nodeEditor.selectModule(m);
    }
  }());

  playerController.on("tick", function (lineNumber, time) {
    tracker.highlightLine(lineNumber);
  });
  playerController.on("change:playing", function (model, playing) {
    if (!playing) {
      tracker.highlightLine(null);
    }
  });

  // Synchronise the <style/> for all players
  (function () {
    var users_style_template = _.template(document.getElementById('users_style_template').innerHTML);
    function updateUsersStyle (users) {
      $('#users_style').html(users.map(function (user) {
        return users_style_template(user.attributes);
      }).join('\n'));
    }
    users.on("add remove", function(user) {
      updateUsersStyle(users);
    });
    updateUsersStyle(users);
  }());



  //~~~ NETWORK

  //~~~ First bind client changes...

  // Tracks
  pattern.tracks.each(function(track){
    track.slots.on("change", function (slot, options) {
      if (options.network) return;
      network.send("set-slot", {
        slot: slot.get("num"), // FIXME
        track: track.get("num"),
        data: slot.toJSON()
      });
    });
  });
  pattern.tracks.on("change:offmode", function (track, value, options) {
    if (options.network) return;
    if (value===CURRENT_USER.id) {
      network.send("user-track-take", {
        track: pattern.tracks.indexOf(track)
      });
    }
    else if (value===null) {
      network.send("user-track-release", {
        track: pattern.tracks.indexOf(track)
      });
    }
  });

  // Current user
  CURRENT_USER.on("change:slot", function (user, value, options) {
    if (options.network) return;
    network.send("user-select-slot", value);
  });

  // Modules
  function bindModule (module) {
    module.properties.each(function (property, i) {
      property.on("change", function (property, options) {
        if (options.network) return;
        network.send("property-change", {
          module: module.id,
          property: i, // FIXME
          value: property.get("value")
        });
      });
    });

    module.on("change:x change:y", _.throttle(function (model, change, options) {
      if (options.network) return;
      network.send("module-position", {
        module: module.id,
        position: { x: module.get("x"), y: module.get("y") }
      });
    }, 100));

    module.outputs.on("add", function (add, collection, options) {
      if (options.network) return;
      network.send("module-output-add", {
        module: module.id,
        output: add.id
      });
    });
    module.outputs.on("remove", function (remove, collection, options) {
      if (options.network) return;
      network.send("module-output-remove", {
        module: module.id,
        output: remove.id
      });
    });
  }
  song.modules.each(bindModule);
  song.modules.on("add", bindModule);
  song.modules.on({
    "add": function(module, collection, options) {
      if (options.network) return;
      var data = module.toJSON();
      data.properties = module.properties.toJSON();
      network.send("add-module", data);
    },
    "remove": function (module, collection, options) {
      if (options.network) return;
      network.send("remove-module", { module: module.id });
    }
  });


  //~~~ now handle server messages

  network.on({
    "user-track-take": function (data, user) {
      pattern.tracks.at(data.track).set("offmode", user, { network: true });
    },
    "user-track-release": function (data, user) {
      pattern.tracks.at(data.track).set("offmode", null, { network: true });
    },
    "user-connect": function (data) {
      users.add(new zound.models.User({ id: data.user }), { network: true });
    },
    "user-disconnect": function (data) {
      users.remove(data.user);
      pattern.tracks.chain()
        .filter(function (track) {
          return track.get("offmode")===data.user;
        })
        .each(function (track) {
          track.set("offmode", null);
        });
    },
    "user-select-slot": function (data, user) {
      users.get(user).set("slot", data, { network: true });
    },
    "set-slot": function(data, user){
      pattern.getSlot(data.track, data.slot).set(data.data, { network: true });
    },
    "module-position": function (data) {
      song.modules.get(data.module).set(data.position, { network: true });
    },
    "module-output-add": function (data) {
      song.modules.get(data.module).outputs.add(
        song.modules.get(data.output), { network: true }
      );
    },
    "module-output-remove": function (data) {
      song.modules.get(data.module).outputs.remove(data.output, { network: true });
    },
    "add-module": function(data) {
      song.modules.add(new modules[data.moduleName](data), { network: true });
    },
    "remove-module": function(data) {
      song.removeModule(data.module, { network: true });
    },
    "property-change": function(data, user) {
      song.modules.get(data.module)
        .properties.at(data.property)
          .set("value", data.value, { network: true });
    }
  });

  //~~~ now, inform the server i'm ready :)
  network.send("user-connect", {
    user: window.CURRENT_USER.id
  });


}(zound.models, zound.modules, zound.ui));
