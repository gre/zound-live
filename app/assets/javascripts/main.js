(function (models, modules, ui) {

  var song = new models.Song();

  var generator = new modules.Generator();
  var output = new modules.Output();

  song.modules.on("change", function () {
    console.log(arguments);
  });

  generator.connect(output);

  song.modules.add(generator);
  song.modules.add(output);

  var nodeEditor = new ui.NodeEditor({
    model: song
  });

}(zound.models, zound.modules, zound.ui));
