(function (models, modules, ui) {

  var song = new models.Song();

  var generator = new modules.Generator({
    x: 50,
    y: 100,
    title: "Gen1"
  });
  var output = new modules.Output({
    x: 300,
    y: 150,
    title: "Output"
  });

  generator.connect(output);

  song.modules.add(generator);
  song.modules.add(output);

  var nodeEditor = new ui.NodeEditor({
    model: song,
    el: '#node-editor'
  });

  // for DEBUG only
  window._song = song;

}(zound.models, zound.modules, zound.ui));
