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
      this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume", value: 50 }),
      this.pType = new zound.models.ModulePropertySelect({ values: DRUM_TYPES, title: "Kit", value: 5 }),
      this.pHihatVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "HiHat Volume", value: 100 }),
      this.pKickVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Kick Volume", value: 100 }),
      this.pSnareVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Snare Volume", value: 100 }),
      this.pTom1Volume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Tom1 Volume", value: 100 }),
      this.pTom2Volume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Tom2 Volume", value: 100 }),
      this.pTom3Volume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Tom3 Volume", value: 100 })
    ]);
    this.volumeControls = [this.pHihatVolume, this.pKickVolume, this.pSnareVolume, this.pTom1Volume, this.pTom2Volume, this.pTom3Volume];
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
    var l = sounds[this.pType.getText()].length;
    var i = note % l;

    sample.buffer = this.buffers[this.pType.getText()][i];
    sample.start(time);
    sample.stop(time + sample.buffer.duration);

    var gain = song.ctx.createGain();
    gain.gain.value = this.pVolume.getPercent()*this.volumeControls[i].getPercent();
    sample.connect(gain);

    var connectData = this.connect(gain, song);
    
    song.execAtTime(_.bind(function () {
      this.trigger("noteOn");
    }, this), time);
    
    song.execAtTime(_.bind(function () {
      this.disconnect(connectData);
      this.refreshAnalyser();
      this.trigger("noteOff");
    }, this), time+sample.buffer.duration);
  },

  noteOff: function (connectData) {
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
