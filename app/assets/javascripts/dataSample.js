
var SONG_SAMPLE_1 = {
  id: "song_1",
  bpm: 125,
  patterns: [
  {
    id: 0,
    length: 32,
    tracks: _.map(_.range(0, 23), function (i) {
      return {
        id: i,
        notes: i>0 ? [] : [{
          id: 0,
          typ: "note",
          note: 40,
          module: 1
        },
        {
          id: 4,
          typ: "off"
        }]
      }
    })
  }
  ],
  modules: [
  {
    id: 0,
    clazz: "Output",
    title: "Output",
    x: 600,
    y: 150
  },
  {
    id: 1,
    clazz: "MultiSynth",
    title: "Multi1",
    x: 60,
    y: 120,
    outputs: [2, 3, 5]
  },
  {
    id: 2,
    clazz: "Generator",
    title: "Gen1",
    x: 160,
    y: 60,
    properties: {
      "type": 2,
      "volume": 10,
      "attack": 125,
      "decay": 500,
      "finetune": -5
    },
    outputs: [4]
  },
  {
    id: 3,
    clazz: "Generator",
    title: "Gen2",
    x: 160,
    y: 190,
    properties: {
      "type": 1,
      "decay": 125,
      "finetune": 3
    },
    outputs: [9]
  },
  {
    id: 4,
    clazz: "Filter",
    title: "Filter1",
    x: 270,
    y: 120,
    properties: {
      "frequency": 1000,
      "Q": 16
    },
    outputs: [9]
  },
  {
    id: 5,
    clazz: "Generator",
    title: "Gen3",
    x: 100,
    y: 300,
    properties: {
      "type": 3
    },
    outputs: [6]
  },
  {
    id: 6,
    clazz: "Filter",
    title: "Filter2",
    x: 250,
    y: 300,
    properties: {
      "frequency": 400,
      "Q": 15
    },
    outputs: [8]
  },
  {
    id: 7,
    clazz: "Drum",
    title: "Drum1",
    x: 370,
    y: 70,
    outputs: [9]
  },
  {
    id: 8,
    clazz: "Delay",
    title: "Delay",
    x: 380,
    y: 290,
    outputs: [9]
  },
  {
    id: 9,
    clazz: "Reverb",
    title: "Reverb",
    x: 450,
    y: 180,
    outputs: [10]
  },
  {
    id: 10,
    clazz: "Compressor",
    title: "Compr.",
    x: 550,
    y: 250,
    properties: {
      "threshold": -20,
      "gain": 60
    },
    outputs: [0]
  }
  ]
};

