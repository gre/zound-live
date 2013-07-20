(function (models, modules, ui) {

  var song = new models.Song();

  var generator1 = new modules.Generator({
    x: 50,
    y: 100,
    title: "Gen1"
  });
  var generator2 = new modules.Generator({
    x: 300,
    y: 50,
    title: "Gen2"
  });
  var output = new modules.Output({
    x: 300,
    y: 150,
    title: "Output"
  });

  generator1.connect(output);

  song.modules.add(generator1);
  song.modules.add(generator2);
  song.modules.add(output);

  var nodeEditor = new ui.NodeEditor({
    model: song,
    el: '#node-editor'
  });

  var currentPropertiesEditor;

  var $moduleProperties = $('#module-properties');

  nodeEditor.on("selectModule", function (module) {
    if (currentPropertiesEditor) {
      currentPropertiesEditor.remove();
    }
    currentPropertiesEditor = new zound.ui.ModulePropertiesEditor({
      model: module
    });
    $moduleProperties.append(currentPropertiesEditor.el);
  });

  window.nodeEditor = nodeEditor;

  // for DEBUG only
  window._song = song;

}(zound.models, zound.modules, zound.ui));
