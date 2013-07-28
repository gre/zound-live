
function song_sample1 () {
  var song = new zound.models.Song();
  var pattern = new zound.models.Pattern();
  song.patterns.add(pattern);

  var output = song.createModule(zound.modules.Output, {
    x: 600,
    y: 150,
    title: "Output"
  });

  var multisynth1 = song.createModule(zound.modules.MultiSynth, {
    x: 60,
    y: 120,
    title: "MultiSynth"
  });

  var generator1 = song.createModule(zound.modules.Generator, {
    x: 160,
    y: 60,
    title: "Gen1"
  });
  generator1.pType.set("value", zound.modules.Generator.GENERATOR_TYPES_NAME.indexOf("square"));
  generator1.pVolume.set("value", 20);
  generator1.pAttack.set("value", 125);
  generator1.pDecay.set("value", 500);

  var generator2 = song.createModule(zound.modules.Generator, {
    x: 160,
    y: 190,
    title: "Gen2"
  });
  generator2.pType.set("value", zound.modules.Generator.GENERATOR_TYPES_NAME.indexOf("triangle"));
  generator2.pDecay.set("value", 125);

  var filter1 = song.createModule(zound.modules.Filter, {
    x: 270,
    y: 120,
    title: "Filter1"
  });
  filter1.pFrequency.set("value", 1000);
  filter1.pQ.set("value", 16);

  var generator3 = song.createModule(zound.modules.Generator, {
    x: 100,
    y: 300,
    title: "Gen3"
  });
  generator3.pType.set("value", zound.modules.Generator.GENERATOR_TYPES_NAME.indexOf("saw"));
  var filter2 = song.createModule(zound.modules.Filter, {
    x: 250,
    y: 300,
    title: "Filter2"
  });
  filter2.pFrequency.set("value", 300);
  filter2.pQ.set("value", 15);

  var drum1 = song.createModule(zound.modules.Drum, {
    x: 370,
    y: 70,
    title: "Drum1"
  });

  var delay1 = song.createModule(zound.modules.Delay, {
    x: 380,
    y: 290,
    title: "Delay"
  });

  var verb1 = song.createModule(zound.modules.Reverb, {
    x: 450,
    y: 180,
    title: "Reverb"
  });

  multisynth1.connect(generator1);
  multisynth1.connect(generator2);
  generator1.connect(filter1);
  generator2.connect(verb1);
  generator3.connect(filter2);
  drum1.connect(verb1);
  filter1.connect(verb1);
  filter2.connect(delay1);
  delay1.connect(verb1);
  verb1.connect(output);

  return song;
}
