(function (SynthModule) {

  zound.modules.MultiSynth = SynthModule.extend({
    canConnectTo: function (out) {
      return out.canPlayNote();
    },
    noteOn: function (note, song, time) {
      song.execAtTime(_.bind(function () {
        this.trigger("noteOn");
      }, this), time);
      return this.outputs.map(function (output) {
        return {
          output: output,
          data: output.noteOn(note, song, time)
        };
      });
    },
    noteOff: function (noteDatas, song, time) {
      song.execAtTime(_.bind(function () {
        this.trigger("noteOff");
      }, this), time);
      _.each(noteDatas, function (noteData) {
        noteData.output.noteOff(noteData.data, song, time);
      });
    }
  });

}(zound.models.SynthModule));
