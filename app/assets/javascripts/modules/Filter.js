(function (EffectModule) {

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
      new zound.models.ModulePropertyRange({ id: "frequency", curve: "inCubic", min: 10, max: 22050, title: "Frequency", value: 22050 }),
      new zound.models.ModulePropertyRange({ id: "Q", min: 0, max: 20, value: 1, title: "Resonance" })
      // new zound.models.ModulePropertyRange({ id: "gain", min: -40, max: 40, title: "gain", value: 0 });
    ]);
    // FIXME: Use of Gain is useless for low and high pass. Removed until more filter support
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


