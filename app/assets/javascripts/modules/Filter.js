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
    this.pType      = new zound.models.ModulePropertySelect({ values: FILTER_TYPES_NAME, title: "Type" });
    this.pFrequency = new zound.models.ModulePropertyRange({ min: 10, max: 22050, title: "Frequency", value: 22050 });
    this.pQ         = new zound.models.ModulePropertyRange({
      max   : 20,
      min   : 0,
      value : 1,
      title : "Resonance" 
    });
    this.pGain      = new zound.models.ModulePropertyRange({
      max   : 40,
      min   : -40,
      title : "gain",
      value : 0
    });
    // FIXME: Use of Gain is useless for low and high pass. Removed until more filter support
    this.properties.add([this.pFrequency, this.pType, this.pQ]);
  },

  init: function (ctx) {
    this.filter = ctx.createBiquadFilter();
    this.updateFrequency();
    this.pFrequency.on("change", _.bind(this.updateFrequency, this));
    this.pType.on("change", _.bind(this.updateFilter, this));
    this.pQ.on("change", _.bind(this.updateQ, this));
    this.pGain.on("change", _.bind(this.updateGain, this));

    this.input = this.filter;
    this.output = this.filter;
  },
  
  updateFrequency: function () {
    this.filter.frequency.value = this.pFrequency.get("value");
  },
  
  updateFilter : function(){
    this.filter.type = FILTER_TYPE_VALUES[this.pType.get("value")];
  },
  
  updateQ: function(){
    this.filter.Q.value = this.pQ.get("value");
  },

  updateGain : function(){
    this.filter.gain.value = this.pGain.get("value");
  }
});

}(zound.models.EffectModule));


