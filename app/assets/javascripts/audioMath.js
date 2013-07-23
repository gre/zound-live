zound.AudioMath = (function () {

  // FIXME: it doesn't seems to be valid
  var NOTE_FREQUENCIES = _.map(_.range(0, 128), function (note) {
      return Math.pow(2, (note-69)/12)*440;
  });

  return {
    // see http://en.wikipedia.org/wiki/Note
    noteToFrequency: function (noteValue) {
      return NOTE_FREQUENCIES[noteValue];
    }
  };
}());
