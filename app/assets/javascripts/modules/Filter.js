(function (EffectModule) {

var LFO_TYPES = ["sine", "square", "sawtooth"];

var BiquadFilterNode = zound.dummyAudioContext.createBiquadFilter();

var FILTER_TYPES = [
  ["Low pass"   , BiquadFilterNode.LOWPASS  ],
  ["High pass"  , BiquadFilterNode.HIGHPASS ]
//["Band pass"  , BiquadFilterNode.BANDPASS ],
//["Low shelf"  , BiquadFilterNode.LOWSHELF ],
//["High shelf" , BiquadFilterNode.HIGHSHELF],
//["Peaking"    , BiquadFilterNode.PEAKING  ],
//["Notch"      , BiquadFilterNode.NOTCH    ],
//["All pass"   , BiquadFilterNode.ALLPASS  ]
];

var FILTER_TYPES_NAME   = _.pluck( FILTER_TYPES, 0);
var FILTER_TYPE_VALUES = _.pluck( FILTER_TYPES, 1);

zound.modules.Filter = EffectModule.extend({

  initialize: function () {
    EffectModule.prototype.initialize.call(this);
    this.properties.add([
      new zound.models.ModulePropertySelect({ id: "type", values: FILTER_TYPES_NAME, title: "Type" }),
      new zound.models.ModulePropertyRange({ id: "frequency", curve: "quad", min: 10, max: 22050, title: "Frequency", value: 22050 }),
      new zound.models.ModulePropertyRange({ id: "Q", min: 0, max: 20, value: 1, title: "Resonance", round: false }),
      // new zound.models.ModulePropertyRange({ id: "gain", min: -40, max: 40, title: "gain", value: 0 });
      //new zound.models.ModulePropertyRange({ id: "lfomix", min: 0, max: 100, value: 100, title: "LFO mix" }),
      new zound.models.ModulePropertyRange({ id: "lfofreq", min: 0.001, value: 5, max: 20, curve: "quad", title: "LFO freq", round: false }),
      new zound.models.ModulePropertyRange({ id: "lfopower", min: 0, value: 0, max: 1, round: false, title: "LFO power" }),
      new zound.models.ModulePropertySelect({ id: "lfotype", values: LFO_TYPES, title: "LFO Type" })
    ]);
    // FIXME: Use of Gain is useless for low and high pass. Removed until more filter support
  },

  // FIXME in the future, this should be a separated module and we should be able to connect a module to any other module property!
  // in that case we have to make a LFO module and connect to the Filter frequency
  createLFO: function (ctx, lfofreqP, lfopowerP, lfotypeP, filterFreqP) {
    var lfo = ctx.createOscillator();
    var lfoGain = ctx.createGain();
    lfo.connect(lfoGain);
    function syncPower () {
      lfoGain.gain.value = lfopowerP.getPercent() * filterFreqP.get("value");
    }    
    function syncFreq () {
      lfo.frequency.value = lfofreqP.get("value");
    }
    function syncType () {
      lfo.type = lfotypeP.get("value");
    }
    syncFreq();
    syncPower();
    syncType();
    lfofreqP.on("change:value", syncFreq);
    lfopowerP.on("change:value", syncPower);
    filterFreqP.on("change:value", syncPower);
    lfotypeP.on("change:value", syncType);
    lfo.start(ctx.currentTime); // FIXME we may use a lfophase property
    return lfoGain;
  },

  init: function (song) {
    EffectModule.prototype.init.apply(this, arguments);
    this.filter = song.ctx.createBiquadFilter();
    this.properties.get("frequency").on("change", _.bind(this.updateFrequency, this));
    this.properties.get("type").on("change", _.bind(this.updateFilter, this));
    this.properties.get("Q").on("change", _.bind(this.updateQ, this));
    //this.properties.get("gain").on("change", _.bind(this.updateGain, this));

    this.updateFilter();
    this.updateFrequency();
    this.updateQ();
    //this.updateGain();

    var lfo = this.createLFO(song.ctx, this.properties.get("lfofreq"), this.properties.get("lfopower"), this.properties.get("lfotype"), this.properties.get("frequency"));
    
    lfo.connect(this.filter.frequency);

    this.input = this.filter;
    this.output = this.filter;
  },

  updateFrequency: function () {
    this.filter.frequency.value = this.properties.get("frequency").get("value");
  },

  updateFilter : function(){
    this.filter.type = FILTER_TYPE_VALUES[this.properties.get("type").get("value")];
  },

  updateQ: function(){
    this.filter.Q.value = this.properties.get("Q").get("value");
  },

  updateGain : function(){
    this.filter.gain.value = this.properties.get("gain").get("value");
  }
});

}(zound.models.EffectModule));


