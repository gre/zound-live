(function (models, modules, ui) {

  var moduleId = 0;

  var availableModules = new models.Modules([
    new modules.Drum({ title: "Drum" }),
    new modules.Filter({ title: "Filter" }),
    new modules.Generator({ title: "Generator" }),
    new modules.Delay({ title: "Delay" }),
    new modules.Reverb({ title: "Reverb" })
  ]);

  // models
  var network = new zound.Network();
  var midiController = new models.MIDIController();

  var song = new models.Song();

  var output = new modules.Output({
    id: moduleId++,
    x: 600,
    y: 150,
    title: "Output"
  });

  var generator1 = new modules.Generator({
    id: moduleId++,
    x: 60,
    y: 190,
    title: "Gen1"
  });
  generator1.pType.set("value", modules.Generator.GENERATOR_TYPES_NAME.indexOf("square"));
  
  var generator2 = new modules.Generator({
    id: moduleId++,
    x: 60,
    y: 60,
    title: "Gen2"
  });
  generator2.pType.set("value", modules.Generator.GENERATOR_TYPES_NAME.indexOf("triangle"));
  
  var filter1 = new modules.Filter({
    id: moduleId++,
    x: 170,
    y: 120,
    title: "Filter1"
  });
  filter1.pFrequency.set("value", 2000);

  var generator3 = new modules.Generator({
    id: moduleId++,
    x: 100,
    y: 300,
    title: "Gen3"
  });
  generator3.pType.set("value", modules.Generator.GENERATOR_TYPES_NAME.indexOf("saw"));
  var filter2 = new modules.Filter({
    id: moduleId++,
    x: 250,
    y: 250,
    title: "Filter2"
  });

  var drum1 = new modules.Drum({
    id: moduleId++,
    x: 320,
    y: 70,
    title: "Drum1"
  });

  var delay1 = new modules.Delay({
    id: moduleId++,
    x: 380,
    y: 280,
    title: "Delay"
  });

  var verb1 = new modules.Reverb({
    id: moduleId++,
    x: 450,
    y: 150,
    title: "Reverb"
  });


  var pattern = new zound.models.Pattern();
  song.patterns.add(pattern);

  /*
  _.each(_.range(0, 40), function (i) {
    var r = Math.floor(Math.random()*Math.random()*3);
    var track = pattern.tracks.at(r);
    track.addNote(
      4*Math.floor(Math.random()*track.slots.size()/4)+Math.floor(Math.random()*Math.random()*4),
      Math.floor(50+20*Math.random()),
      r==1 ? generator1 : r==2 ? generator2 : drum1
    );
  });
  */

  generator1.connect(filter1);
  generator2.connect(filter1);
  generator3.connect(filter2);
  drum1.connect(verb1);
  filter1.connect(verb1);
  filter2.connect(delay1);
  song.modules.add(generator1);
  song.modules.add(generator2);
  song.modules.add(generator3);
  song.modules.add(filter1);
  song.modules.add(filter2);
  song.modules.add(drum1);
  song.modules.add(delay1);
  song.modules.add(verb1);


  delay1.connect(verb1);
  verb1.connect(output);

  song.modules.add(output);

  var queryStringParams = (function (queryString) {
    return _.reduce(queryString.substring(1).split("&"), function (obj, param) {
      var parts = param.split("=");
      obj[parts[0]] = parts[1];
      return obj;
    }, {});
  }(location.search));

  var users = new zound.models.Users([]);

  window.CURRENT_USER =
    new zound.models.User({ name : queryStringParams.user || "gre" });
  //users.at(0);
  users.push(window.CURRENT_USER);


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

  availableModules.on("selectModule", function (module) {
    var m = module.clone();
    m.set("id", moduleId++);
    var title = m.get("title");
    if (title.length > 6) title = title.substring(0,5)+".";
    m.set("title", title+moduleId);
    song.modules.add(m);
  });

  // views

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
  nodeEditor.on("selectModule", function (module) {
    CURRENT_USER.selectModule(module);
    if (currentPropertiesEditor) {
      currentPropertiesEditor.remove();
    }
    currentPropertiesEditor = new zound.ui.ModulePropertiesEditor({
      model: module
    });
    $('#module-properties').append(currentPropertiesEditor.el);
  });
  var m = song.modules.first();
  if (m) {
    nodeEditor.selectModule(m);
  }

  playerController.on("record", function () {
    var lastSelection = tracker.tracks[0].slots[0];
    CURRENT_USER.selectTrackerSlot(lastSelection);
  });
  playerController.on("tick", function (lineNumber, time) {
    song.scheduleNote(lineNumber, time);
    if(playerController.recording)
      CURRENT_USER.moveTo(lineNumber);
    tracker.highlightLine(lineNumber);
  });
  playerController.on("stop", function () {
    tracker.highlightLine(null);
  });

  // bind user style
  var users_style_template = _.template(document.getElementById('users_style_template').innerHTML);
  function updateUsersStyle (users) {
    $('#users_style').html(users.map(function (user) {
      return users_style_template(user.attributes);
    }).join('\n'));
  }

  function bindMyself(user) {
    user.on("user-change", function(user, slot, track){
      network.send("user-change", {
        "slot" : slot,
        "track" : track
      })
    })
  }

  bindMyself(CURRENT_USER);

  users.on("add remove", function(user) {
    updateUsersStyle(users);
  });
  updateUsersStyle(users);


  var trackerIncrement = new zound.ui.TrackerIncrement({
    model: CURRENT_USER,
    id: "tracker-increment"
  });
  $('#tracker').append(trackerIncrement.el);

  var keyboardController = new zound.models.KeyboardController({
    user: CURRENT_USER
  });

  var handleNote = function (note) {

    var module = CURRENT_USER.getCurrentModule();
    var slot = CURRENT_USER.getSelectedSlot();

    if (module && module.canPlayNote())
      module.noteOn(note, song.ctx, song.ctx.currentTime);

    if (module && module.canPlayNote() && slot) {
      slot.model.set({
        note: note,
        module: module
      });
      CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"));
    }
  };

  keyboardController.on({
    note: handleNote
  });

  midiController.on({
    noteOn: handleNote
  });

  // Handle selection
  (function(){
    var lastSelection = tracker.tracks[0].slots[0];
    /*
    $(window).click(function (e) {
      var slot = CURRENT_USER.getSelectedSlot();
      if (slot) {
        lastSelection = slot;
        if (!$(e.target).parents('#tracker:first').size()) {
          CURRENT_USER.unselectCurrentTrackerSlot();
        }
      }
    });
    */
    $(window).on("keydown", function (e) {
      var slot = CURRENT_USER.getSelectedSlot();

      // Spacebar toggle the user tracker selection
      if (e.which===32) { // SPACE
        e.preventDefault();
        if (slot) {
          lastSelection = slot;
          CURRENT_USER.unselectCurrentTrackerSlot();
        }
        else {
          lastSelection && CURRENT_USER.selectTrackerSlot(lastSelection);
        }
        return;
      }

      if (e.which==8) { // BACKSPACE
        e.preventDefault();
        if (slot) {
          slot.model.set({ note: null, module: null });
          CURRENT_USER.moveTrackerSelection(0, -1);
        }
        return;
      }

      if (e.which==46 && slot) { // DELETE
        if (slot) {
          e.preventDefault();
          slot.model.set({ note: null, module: null });
          CURRENT_USER.moveTrackerSelection(0, CURRENT_USER.get("trackerIncrement"));
        }
        return;
      }

      var incrX = 0, incrY = 0;
      switch (e.which) {
        case 37: // left
          incrX = -1;
          break;
        case 39: // right
          incrX = 1;
          break;
        case 38: // up
          incrY = -1;
          break;
        case 40: // down
          incrY = 1;
          break;
      }
      if ((incrX || incrY) && slot) {
        e.preventDefault();
        CURRENT_USER.moveTrackerSelection(incrX, incrY);
      }
    });
  }());


  pattern.tracks.each(function(track){

    track.slots.each(function(slot){
      slot.on("change", function(slot){
        var note = slot.get("note");
        var module = slot.get("module");
        if(note === null){
          network.send("del-note", {
            slot: slot.get("num"),
            track: track.get("num")
          });
        }
        else {
          network.send("add-note", {
            slot: slot.get("num"),
            track: track.get("num"),
            note: note,
            module: module.id
          });
        }
      });
    });

  });

  function bindModule (module) {
    module.properties.each(function (property, i) {
      property.on("change", function (property) {
          network.send("property-change", {
            module: module.cid,
            property: i,
            value: property.get("value")
          });
      });
    });
  }

  song.modules.each(bindModule);
  song.modules.on("add", bindModule);


  // for DEBUG only
  window._song = song;

  // INITIALIZES NETWORK
  network.send("user-connect", {
    user : window.CURRENT_USER.get("name")
  })

  network.on("ws-user-connect", function(o){
    console.log(o.data.user+" CONNECTED");
    var user = new zound.models.User({ name : o.data.user });
    users.add(user);
  });

  network.on("ws-user-change", function(o){
    var user = users.find(function (user) {
      return user.get("name") == o.user;
    });
    var slot = tracker.tracks[o.data.track].slots[o.data.slot];
    user.selectTrackerSlot(slot);
  });

  network.on("ws-add-note", function(o){
    var note = o.data.note
      , module = song.modules.get(o.data.module);
    var slot = tracker.tracks[o.data.track].slots[o.data.slot].model;
    slot.set({
      note: note,
      module: module
    });
  });

  network.on("ws-del-note", function(o){
    var slot = tracker.tracks[o.data.track].slots[o.data.slot].model;
    slot.set({
      note: null,
      module: null
    });
  });
  // bind Network
  song.modules.on("add", function(module) {
      var data = module.toJSON();
      data.properties = module.properties.toJSON();
      network.send("add-module", data);
  });

  network.on("ws-add-module", function(o) {
      var m = new modules[o.data.moduleName](o.data);
      song.modules.add(m);
  });

  var bindModuleNetwork = function (module) {
      module.on("change", function (module) {
          var data = modules.toJson()
          data.cid = module.cid
          network.send("change-module", data)
      })
  }

  network.on("ws-change-module", function (data) {
      song.modules.find(function (e) {
          return e.cid == data.cid
      })
  })

  network.on("ws-property-change", function(o) {
    var module = song.modules.get(o.data.module)
        ,propertyIdx = o.data.property
        ,value = o.data.value;

    var property = module.properties.at(propertyIdx);
    property.set("value", value);
  });

}(zound.models, zound.modules, zound.ui));
