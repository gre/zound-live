(function (Module) {

/*var sounds = _.map(['hihat.aif', 'kick.aif', 'snare.aif', 'tom1.aif', 'tom2.aif', 'tom3.aif', 'hihat.wav', 'kick.wav', 'snare.wav', 'tom1.wav', 'tom2.wav', 'tom3.wav'], function(s){
  return '/assets/sounds/drums/acoustic-kit/' + s;
});*/ // XXX: aif is not supported...

var sounds = _.map(['hihat.wav', 'kick.wav', 'snare.wav', 'tom1.wav', 'tom2.wav', 'tom3.wav'], function(s){
  return '/assets/sounds/drums/acoustic-kit/' + s;
});

zound.modules.Drum = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Drum",
    color: "#622"
  }),

  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 100 });
    this.properties.add([this.pVolume]);
  },

  canHaveInputs: function () {
    return false;
  },

  canPlayNote: function () {
    return true;
  },

  init: function (ctx) {
    this.promiseOfSounds = Q.all(_.map(sounds, function(s){
      return this._loadSound(ctx, s);
    }, this));
    return this.promiseOfSounds.then(_.bind(function (sounds) {
      this.buffers = sounds;
    }, this));
  },

  noteOn: function (note, ctx, time) {
    if(this.promiseOfSounds.isPending())
      return;

    var sample = ctx.createBufferSource();
    sample.buffer = this.buffers[note % sounds.length];
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

  _loadSound: function(ctx, url) {
    var d = Q.defer();
    var request = new XMLHttpRequest();
    request.open('GET', url, true);
    request.responseType = 'arraybuffer';

    request.onload = function() {
      ctx.decodeAudioData(request.response, function(b) {
        d.resolve(b);
      }, function(e){
        d.reject(e);
      });
    };
    request.onerror = function(e) {
      d.reject(e);
    };
    request.send();
    return d.promise;
  }

}, {
  moduleName: "Drum"
});

}(zound.models.Module));
