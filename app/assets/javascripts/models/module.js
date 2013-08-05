
// FIXME need to clean some mess around all disconnect / unplug (leaks)

zound.models.Module = Backbone.Model.extend({
  defaults: {
    x: 100,
    y: 100
  },
  initialize: function (opts) {
    // FIXME: can't find a better DRY way :'( - this won't support modules inheritance
    for (var m in zound.modules) {
      if (this instanceof zound.modules[m]) {
        this.set("moduleName", m);
      }
    }
    if (!this.get("title")) this.set("title", this.constructor.moduleName+this.id);
    this.outputs = new zound.models.Modules();
    this.properties = new zound.models.ModuleProperties();

    this.samplesLength = 512;
    this.waveData = new Uint8Array(this.samplesLength);
    for (var i=0; i<this.samplesLength; ++i) {
      this.waveData[i] = 127;
    }
  },

  init: function (song) {
    // init with an AudioContext
    this.analyserNode = song.ctx.createAnalyser();
  },

  getWaveData: function () {
    if (this.analyserNode)
      this.analyserNode.getByteTimeDomainData(this.waveData);
    return this.waveData;
  },

  getDisplayId: function () {
    return zound.models.Module.idToText(this.id);
  },
  // Can the module ever have outputs?
  canHaveOutputs: function (module) {
    return true;
  },
  // Can I play notes from that module?
  canPlayNote: function () {
    return "noteOn" in this; // duck typing by default
  },
  // Can I plug that module to another one?
  canConnectTo: function (module) {
    return "plugInput" in module; // duck typing by default
  },

  connectDatas: [],

  connect: function (node, song) {
    var plugInputF = function (outModule) {
      outModule.plugInput(node, song);
    };
    var unplugInputF = function (outModule) {
      outModule.unplugInput(node, song);
    };
    this.outputs.each(plugInputF);
    this.outputs.on("add", plugInputF);
    this.outputs.on("remove", unplugInputF);
    node.connect(this.analyserNode);

    this.connectDatas.push({
      node: node,
      plugInputF: plugInputF,
      unplugInputF: unplugInputF
    });
  },

  disconnect: function (node) {
    node.disconnect(this.analyserNode);
    var split = _.groupBy(this.connectDatas, function (d) {
      return d.node === node ? "node" : "others";
    });
    this.connectDatas = split.others;
    _.each(split.node, function (data) {
      this.outputs.off("add", data.plugInputF);
      this.outputs.off("remove", data.unplugInputF);
    }, this);
    node.disconnect(this.analyserNode);
  }

}, {
  idToText: function (id) {
    var name = ""+id;
    if (name.length>2) name=name.substring(name.length-2);
    else if (name.length==1) name = "0"+name;
    return name;
  }
});

zound.models.SynthModule = zound.models.Module.extend({
  // FIXME: leak?
  noteOn: function (note, song, time) {
    throw "noteOn not implemented";
  },

  noteOff: function (noteData, song, time) {
    // noteData is the value returned by the noteOn function
  }
});

zound.models.EffectModule = zound.models.Module.extend({
  // Default plug and unplug functions are using this.input and this.output,
  // you have to set it in your init() implementation
  plugInput: function (nodeInput, song) {
    nodeInput.connect(this.input);
    this.connect(this.output, song);
  },
  unplugInput: function (nodeInput, song) {
    nodeInput.disconnect(this.input);
    this.disconnect(nodeInput);
  }
});

zound.models.Modules = Backbone.Collection.extend({
  model: zound.models.Module
});
