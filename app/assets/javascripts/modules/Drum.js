(function (Module) {

/*var sounds = _.map(['hihat.aif', 'kick.aif', 'snare.aif', 'tom1.aif', 'tom2.aif', 'tom3.aif', 'hihat.wav', 'kick.wav', 'snare.wav', 'tom1.wav', 'tom2.wav', 'tom3.wav'], function(s){
  return '/assets/sounds/drums/acoustic-kit/' + s;
});*/ // XXX: aif is not supported...

var sounds = _.map(['hihat.wav', 'kick.wav', 'snare.wav', 'tom1.wav', 'tom2.wav', 'tom3.wav'], function(s){
  return '/assets/sounds/drums/acoustic-kit/' + s;
});

var buffers = [];

zound.modules.Drum = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Drum",
    color: "#622"
  }),

  initialize: function () {
    Module.prototype.initialize.call(this);
    this._isLoading = false;
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 100 });
    this.properties.add([this.pVolume]);
  },

  canHaveInputs: function () {
    return false;
  },

  canPlayNote: function () {
    return true;
  },

  noteOn: function (note, ctx, time) {

    if(!this._isLoading && !this._isReady()) {
      this._isLoading = true;
      var me = this;
      _.each(sounds, function(s){ me._loadSound(ctx, s) });
    }

    if(!this._isReady())
      return;

    var sample = ctx.createBufferSource();
    sample.buffer = buffers[note % sounds.length];
    sample.start(time);
    sample.stop(time + 0.3); // TODO: real sound duration

    var gain = ctx.createGain();
    gain.gain.value = this.pVolume.getPercent();

    sample.connect(gain);
    this.broadcastToOutputs(gain, ctx);
  },

  noteOff: function () {
    // needed?
  },

  _isReady: function(){
    return buffers.length == sounds.length;
  },

  _loadSound: function(ctx, url) {
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      ctx.decodeAudioData(request.response, function(b) {
        buffers.push(b);
      }, function(e){ console.error(e); });
    };
    request.send();
  }

}, {
  moduleName: "Drum"
});

}(zound.models.Module));