(function (SynthModule) {

  zound.modules.MultiSynth = SynthModule.extend({
    canConnectTo: function (out) {
      return out.canPlayNote();
    },
    noteOn: function (note, ctx, time) {
      return this.outputs.map(function (output) {
        return {
          output: output,
          data: output.noteOn(note, ctx, time)
        };
      });
    },
    noteOff: function (noteDatas, ctx, time) {
      _.each(noteDatas, function (noteData) {
        noteData.output.noteOff(noteData.data, ctx, time);
      });
    }
  });

}(zound.models.SynthModule));
