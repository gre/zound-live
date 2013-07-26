(function (models, modules, ui) {

  // FIXME Put that in song.js
  // Set context as global, for now
  /*
  window.ctx = new webkitAudioContext();
  // Seems to be a weird bug in ctx if never start an osc == never start ctx.currentTime.
  var osc = ctx.createOscillator();
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.001);
  */


  // models
  var midiController = new models.MIDIController();

  var song = new models.Song();

  var output = new modules.Output({
    id: 0,
    x: 300,
    y: 150,
    title: "Output"
  });
  var generator1 = new modules.Generator({
    id: 1,
    x: 50,
    y: 100,
    title: "Gen1"
  });
  generator1.pType.set("value", modules.Generator.GENERATOR_TYPES_NAME.indexOf("square"));
  var generator2 = new modules.Generator({
    id: 2,
    x: 100,
    y: 40,
    title: "Gen2"
  });
  generator2.pType.set("value", modules.Generator.GENERATOR_TYPES_NAME.indexOf("triangle"));
  var filter1 = new modules.Filter({
    id: 3,
    x: 170,
    y: 120,
    title: "Filter1"
  });
  filter1.pFrequency.set("value", 2000);
  var drum1 = new modules.Drum({
    id: 4,
    x: 200,
    y: 200,
    title: "Drum1"
  });

  var pattern = new zound.models.Pattern();
  song.patterns.add(pattern);

  _.each(_.range(0, 40), function (i) {
    var r = Math.floor(Math.random()*Math.random()*3);
    var track = pattern.tracks.at(r);
    track.addNote(
      4*Math.floor(Math.random()*track.slots.size()/4)+Math.floor(Math.random()*Math.random()*4),
      Math.floor(50+20*Math.random()),
      r==1 ? generator1 : r==2 ? generator2 : drum1
    );
  });

  generator1.connect(filter1);
  generator2.connect(filter1);
  drum1.connect(output);
  filter1.connect(output);

  song.modules.add(generator1);
  song.modules.add(generator2);
  song.modules.add(filter1);
  song.modules.add(drum1);
  song.modules.add(output);

  var queryStringParams = (function (queryString) {
    return _.reduce(queryString.substring(1).split("&"), function (obj, param) {
      var parts = param.split("=");
      obj[parts[0]] = parts[1];
      return obj;
    }, {});
  }(location.search));

  // FIXME: mock: init from the server?
  var users = new zound.models.Users([
      { name: queryStringParams.user || "gre" },
      { name: "pvo" },
      { name: "ast" },
      { name: "eca" },
      { name: "aau" },
      { name: "aau" },
      { name: "vbr" },
      { name: "jto" }]);

  window.CURRENT_USER = users.at(0);


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

  playerController.on("tick", function (lineNumber, time) {
    song.scheduleNote(lineNumber, time);
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
  users.on("add remove", function () {
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


  // for DEBUG only
  window._song = song;

  // NETWORK
  var bindModule = function(module){
    module.on("change:x", function(module){
      console.log(arguments);
    });
  };

}(zound.models, zound.modules, zound.ui));
