(function (models, modules, ui) {

  //~~~ MODELS

  var network = new zound.Network();
  var users = new zound.models.Users([ window.CURRENT_USER ]);

  var song = song_sample1();
  window._song = song; // for DEBUG only
  var pattern = song.patterns.first();

  var midiController = new models.MIDIController();

  var playerController = new models.PlayerController({
    length: song.get("length"),
    bpm: song.get("bpm")
  });
  song.on("change:length", function (song, length) {
    playerController.set("length", length);
  });
  song.on("change:bpm", function (song, bpm) {
    playerController.set("bpm", bpm);
  });
  playerController.setAudioContext(song.ctx);
  /*
  // FIXME: blur is too aggressive, we more need a "on tab change"
  $(window).blur(function () {
    playerController.stop();
  });
  */

  var availableModules = new models.Modules([
    new modules.Generator({ title: "Generator" }),
    new modules.Drum({ title: "Drum" }),
    new modules.MultiSynth({ title: "MultiSynth" }),
    new modules.Filter({ title: "Filter" }),
    new modules.Delay({ title: "Delay" }),
    new modules.Reverb({ title: "Reverb" })
  ]);

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

  //~~~ VIEWS 

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

  var player = new ui.Player({
    model: playerController
  });
  $('#toolbar').append(player.el);

  var moduleChooser = new ui.ModulesChooser({
    model: availableModules
  });
  $('#module-collection').append(moduleChooser.el);

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
  var m = song.modules.find(function (module) {
    return module instanceof zound.models.SynthModule;
  });
  if (m) {
    nodeEditor.selectModule(m);
  }

  playerController.on("change:recording", function (model, recording) {
    if (recording && !CURRENT_USER.get("slot"))
      CURRENT_USER.set("slot", { track: 0, slot: 0 });
  });
  playerController.on("tick", function (lineNumber, time) {
    song.scheduleNote(lineNumber, time);
    if(playerController.get("recording"))
      CURRENT_USER.moveTo(lineNumber);
    tracker.highlightLine(lineNumber);
  });
  playerController.on("change:playing", function (model, playing) {
    if (!playing) {
      tracker.highlightLine(null);
      song.releaseHoldingNotes();
    }
  });

  // bind user style
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


  var trackerIncrement = new zound.ui.TrackerIncrement({
    model: CURRENT_USER,
    id: "tracker-increment"
  });
  $('#tracker').append(trackerIncrement.el);

  var keyboardController = new models.KeyboardController(_.extend({
    user: CURRENT_USER
  }, models.KeyboardController[window.KEYBOARD_LAYOUT+"config"]));


  var noteDatas = {};

  var handleNoteOn = function (note, velocity) {
    var module = song.modules.get(CURRENT_USER.get("module"));
    var slot = CURRENT_USER.get("slot");

    if (module && module.canPlayNote()) {
      var data = module.noteOn(note, song.ctx, song.ctx.currentTime);
      if (noteDatas[note]) {
        noteDatas[note].module.noteOff(noteDatas[note].data, song.ctx, song.ctx.currentTime);
      }
      noteDatas[note] = { data: data, module: module };
    }

    if (module && module.canPlayNote() && slot) {
      var slotModel = pattern.getSlot(slot.track, slot.slot);
      slotModel.setNote(note, module.id);
      CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"), pattern.tracks.size(), pattern.get("length"));
    }
  };

  var handleNoteOff = function (note) {
    if (noteDatas[note]) {
      noteDatas[note].module.noteOff(noteDatas[note].data, song.ctx, song.ctx.currentTime);
      noteDatas[note] = null;
    }
    var module = song.modules.get(CURRENT_USER.get("module"));
    var slot = CURRENT_USER.get("slot");
    if (module && module.canPlayNote() && slot) {
      var slotModel = pattern.getSlot(slot.track, slot.slot);
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

  //~~~ NETWORK

  pattern.tracks.each(function(track){

    track.slots.each(function(slot){
      slot.on("change", function(slot){
        network.send("set-slot", {
          slot: slot.get("num"), // FIXME
          track: track.get("num"),
          data: slot.toJSON()
        });
      });
    });

  });

  pattern.tracks.on("change:offmode", function (track, value) {
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

  network.on("user-track-take", function (data, user) {
    pattern.tracks.at(data.track).set("offmode", user);
  });
  
  network.on("user-track-release", function (data, user) {
    pattern.tracks.at(data.track).set("offmode", null);
  });

  network.send("user-connect", {
    user: window.CURRENT_USER.id
  });

  network.on("user-connect", function(data){
    console.log(data.user+" CONNECTED");
    var user = new zound.models.User({ id: data.user });
    users.add(user);
  });

  CURRENT_USER.on("change:slot", function (user, value) {
    network.send("user-select-slot", value);
  });
  network.on("user-select-slot", function(data, user){
    var user = users.get(user);
    user.set("slot", data);
  });

  CURRENT_USER.on("user-unselect-slot", function () {
    network.send("user-unselect-slot");
  });
  network.on("user-unselect-slot", function(data, user){
    users.get(user).set("slot", null);
  });

  network.on("set-slot", function(data, user){
    pattern.getSlot(data.track, data.slot).set(data.data);
  });

  function bindModule (module) {
    module.properties.each(function (property, i) {
      property.on("change", function (property) {
          network.send("property-change", {
            module: module.id,
            property: i,
            value: property.get("value")
          });
      });
    });

    // FIXME: this throttle makes the event going crazy ping / pong
    // due to the hacky way we avoid recursivity loop in network
    /*
    module.on("change:x change:y", _.throttle(function () {
      network.send("module-position", {
        module: module.id,
        x: module.get("x"),
        y: module.get("y")
      });
    }, 200));
    */
    module.on("change:x change:y", function () {
      network.send("module-position", {
        module: module.id,
        x: module.get("x"),
        y: module.get("y")
      });
    });
    

    module.outputs.on("add", function (add) {
      network.send("module-output-add", {
        module: module.id,
        output: add.id
      });
    });
    module.outputs.on("remove", function (remove) {
      network.send("module-output-remove", {
        module: module.id,
        output: remove.id
      });
    });
  }

  song.modules.each(bindModule);
  song.modules.on("add", bindModule);

  network.on("module-position", function (data) {
    song.modules.get(data.module).set({
      x: data.x,
      y: data.y
    });
  });

  network.on("module-output-add", function (data) {
    song.modules.get(data.module).outputs.add(
      song.modules.get(data.output)
    );
  });

  network.on("module-output-remove", function (data) {
    song.modules.get(data.module).outputs.remove(data.output)
  });

  song.modules.on("add", function(module) {
      var data = module.toJSON();
      data.properties = module.properties.toJSON();
      network.send("add-module", data);
  });
  network.on("add-module", function(data) {
    var m = new modules[data.moduleName](data);
    song.modules.add(m);
  });

  song.modules.on("remove", function (module) {
      network.send("remove-module", { module: module.id });
  });
  network.on("remove-module", function(data) {
    song.removeModule(data.module);
  });

  network.on("property-change", function(data, user) {
    song.modules.get(data.module)
      .properties.at(data.property)
        .set("value", data.value);
  });

}(zound.models, zound.modules, zound.ui));
