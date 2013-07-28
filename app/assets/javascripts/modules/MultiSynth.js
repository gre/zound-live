(function (SynthModule) {

  zound.modules.MultiSynth = SynthModule.extend({
    canConnectTo: function (out) {
      return out.canPlayNote();
    },
    noteOn: function (note, ctx, time) {
      this.outputs.each(function (output) {
        output.noteOn(note, ctx, time);
      });
    }
  });

}(zound.models.SynthModule));
