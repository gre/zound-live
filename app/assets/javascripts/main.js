(function (models, modules, ui) {

  // models

  var midiController = new models.MIDIController();

  var song = new models.Song();

  var generator1 = new modules.Generator({
    id: 1,
    x: 50,
    y: 100,
    title: "Gen1"
  });
  var generator2 = new modules.Generator({
    id: 2,
    x: 300,
    y: 50,
    title: "Gen2"
  });
  var output = new modules.Output({
    id: 3,
    x: 300,
    y: 150,
    title: "Output"
  });

  var pattern = new zound.models.Pattern();
  song.patterns.add(pattern);

  _.each(_.range(0, 40), function (i) {
    var track = pattern.tracks.at(Math.floor(Math.random()*pattern.tracks.size()));
    track.addNote(
      Math.floor(Math.random()*track.slots.size()),
      Math.floor(20+40*Math.random()),
      Math.random()<0.5 ? generator1 : generator2
    );
  });

  generator1.connect(output);

  song.modules.add(generator1);
  song.modules.add(generator2);
  song.modules.add(output);

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

  var currentPropertiesEditor;
  nodeEditor.on("selectModule", function (module) {
    if (currentPropertiesEditor) {
      currentPropertiesEditor.remove();
    }
    currentPropertiesEditor = new zound.ui.ModulePropertiesEditor({
      model: module
    });
    $('#module-properties').append(currentPropertiesEditor.el);
  });

  window.nodeEditor = nodeEditor;

  // for DEBUG only
  window._song = song;

}(zound.models, zound.modules, zound.ui));
