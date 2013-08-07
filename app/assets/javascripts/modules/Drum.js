(function (SynthModule) {

var DRUM_TYPES = [
  '4OP-FM',
  'Bongos',
  'CR78',
  'KPR77',
  'Kit3',
  'Kit8',
  'LINN',
  'R8',
  'Stark',
  'Techno',
  'TheCheebacabra1',
  'TheCheebacabra2',
  'acoustic-kit',
  'breakbeat13',
  'breakbeat8',
  'breakbeat9'
];

var sounds = _.object(_.map(DRUM_TYPES, function(kit) {
  var ss =  _.map(['hihat.wav', 'kick.wav', 'snare.wav', 'tom1.wav', 'tom2.wav', 'tom3.wav'], function(s){
    return '/assets/sounds/drums/' + kit + '/' + s;
  });
  return [kit, ss];
}));

zound.modules.Drum = SynthModule.extend({
  initialize: function () {
    SynthModule.prototype.initialize.call(this);
    this.properties.add([
      new zound.models.ModulePropertyRange({ id: "volume", min: 0, max: 100, title: "Volume", value: 50 }),
      new zound.models.ModulePropertySelect({id: "type", values: DRUM_TYPES, title: "Kit", value: 5 }),
      new zound.models.ModulePropertyRange({ id: "hihatVolume", min: 0, max: 100, title: "HiHat Volume", value: 100 }),
      new zound.models.ModulePropertyRange({ id: "kickVolume", min: 0, max: 100, title: "Kick Volume", value: 100 }),
      new zound.models.ModulePropertyRange({ id: "snareVolume", min: 0, max: 100, title: "Snare Volume", value: 100 }),
      new zound.models.ModulePropertyRange({ id: "tom1Volume", min: 0, max: 100, title: "Tom1 Volume", value: 100 }),
      new zound.models.ModulePropertyRange({ id: "tom2Volume", min: 0, max: 100, title: "Tom2 Volume", value: 100 }),
      new zound.models.ModulePropertyRange({ id: "tom3Volume", min: 0, max: 100, title: "Tom3 Volume", value: 100 })
    ]);
    this.volumeControls = ["hihatVolume", "kickVolume", "snareVolume", "tom1Volume", "tom2Volume", "tom3Volume"];
  },

  init: function (song) {
    SynthModule.prototype.init.apply(this, arguments);
    var me = this;
    var as = _.map(_.pairs(sounds), function(v){

      var kit = v[0],
          paths = v[1];

      var es =
        Q.all(_.map(paths, function(p){
          return me._loadSound(song.ctx, p);
        })).then(function(sounds){
          return [kit, sounds];
        });

      return es;
    });

    this.promiseOfSounds = Q.all(as).then(_.object);

    return this.promiseOfSounds.then(_.bind(function (sounds) {
      this.buffers = sounds;
    }, this));
  },

  noteOn: function (note, song, time) {
    if(this.promiseOfSounds.isPending()) return;
    var sample = song.ctx.createBufferSource();
    var gain = song.ctx.createGain();
    sample.connect(gain);

    var l = sounds[this.properties.get("type").getText()].length;
    var i = note % l;

    sample.buffer = this.buffers[this.properties.get("type").getText()][i];
    sample.start(time);
    sample.stop(time + sample.buffer.duration);

    gain.gain.value = this.properties.get("volume").getPercent()*this.properties.get(this.volumeControls[i]).getPercent();

    this.connect(gain, song);
    
    song.execAtTime(_.bind(function () {
      this.trigger("noteOn");
    }, this), time);
    
    song.execAtTime(_.bind(function () {
      this.disconnect(gain);
      this.trigger("noteOff");
    }, this), time+sample.buffer.duration+0.1);
  },

  noteOff: function () {
    // noteOff has no effect in Drum
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

});

}(zound.models.SynthModule));
