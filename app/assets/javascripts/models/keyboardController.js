
// Play notes with the keyboard

zound.models.KeyboardController = Backbone.Model.extend({
  defaults: {
    octave: 3,
    keyCodeByTones: [87,83,88,68,67,86,71,66,72,78,74,188]
  },
  initialize: function () {
    $(window).on("keyup", _.bind(this.onKeydown, this));
  },
  onKeydown: function (e) {
    var slot = this.get("user").getSelectedSlot();
    if (slot) {
      if (48 <= e.which && e.which <= 57) {
        var octave = e.which - 48;
        this.set("octave", octave);
        e.preventDefault();
      }
      else {
        var tone = this.get("keyCodeByTones").indexOf(e.which);
        if (tone > -1) {
          var note = this.get("octave")*12+tone;
          this.trigger("note", note, 127);
        }
      }
    }
  }
});
