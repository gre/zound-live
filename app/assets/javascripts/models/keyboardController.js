(function(){
// Play notes with the keyboard

var AZERTYconfig = {
  decrementOctaveKey: 186, // ":"
  incrementOctaveKey: 187, // "="
  keyCodeByTones: [
    87,83,88,68,67,86,71,66,72,78,74,188, // first octave (lower keyboard)
    65,50,90,222,69,82,53,84,54,89,55,85 // second octave (up keyboard)
  ],
  noteOff: 189 // use '-', can't make the '<' key working.. it is the same as ',' ...
};

var QWERTYconfig = {
  decrementOctaveKey: 190,
  incrementOctaveKey: 191,
  keyCodeByTones: [
    90,83,88,68,67,86,71,66,72,78,74,77, // first octave (lower keyboard)
    81,50,87,51,69,82,53,84,54,89,55,85 // second octave (up keyboard)
  ],
  noteOff: 192
};

zound.models.KeyboardController = Backbone.Model.extend({
  defaults: _.extend({
    octave: 3,
    unselectKey: 27, // escape
    playKey: 32, // space
    backspaceKey: 8,
    deleteKey: 46,
    keyCodeByTones: []
  }, AZERTYconfig),
  initialize: function () {
    $(window).on("keydown", _.bind(this.onKeydown, this));
    $(window).on("keyup", _.bind(this.onKeyup, this));
  },
  keysDown: [],
  onKeyup: function (e) {
    if (!e.which) return;
    this.keysDown = _.filter(this.keysDown, function (key) {
      return key !== e.which;
    });
    var tone = this.get("keyCodeByTones").indexOf(e.which);
    if (tone > -1) {
      e.preventDefault();
      var note = this.get("octave")*12+tone;
      if (note >= 0 && note <= 127) {
        this.trigger("noteOff", note);
      }
    }
  },
  onKeydown: function (e) {
    if (!e.which) return;
    var alreadyPressed = _.contains(this.keysDown, e.which);
    this.keysDown.push(e.which);
    if (e.altKey || e.shiftKey || e.metaKey || e.altKey) return;
    var incrX = 0, incrY = 0;

    var slot = CURRENT_USER.get("slot");
    if (slot && e.which===this.get("unselectKey") && !alreadyPressed) {
      e.preventDefault();
      this.trigger("unselect");
    }
    else if (e.which===this.get("playKey") && !alreadyPressed) {
      e.preventDefault();
      this.trigger("play-pause");
    }
    else if (e.which===this.get("backspaceKey")) {
      e.preventDefault();
      if (slot) {
        this.trigger("tracker-backspace");
      }
    }
    else if (e.which==this.get("deleteKey")) {
      if (slot) {
        e.preventDefault();
        this.trigger("tracker-delete");
      }
      else if (CURRENT_USER.get("module") && !alreadyPressed) {
        e.preventDefault();
        this.trigger("module-delete");
      }
    }
    else if (e.which===37) { // left
      incrX = -1;
    }
    else if (e.which===39) { // right
      incrX = 1;
    }
    else if (e.which===38) { // up
      incrY = -1;
    }
    else if (e.which===40) { // down
      incrY = 1;
    }
    else if (e.which===this.get("incrementOctaveKey")) {
      this.set("octave", Math.min(9, this.get("octave")+1));
    }
    else if (e.which===this.get("decrementOctaveKey")) {
      this.set("octave", Math.max(0, this.get("octave")-1));
    }
    else if (slot && e.which===this.get("noteOff")) {
      this.trigger("tracker-off");
    }
    else {
      var tone = this.get("keyCodeByTones").indexOf(e.which);
      if (!alreadyPressed && tone > -1) {
        e.preventDefault();
        var note = this.get("octave")*12+tone;
        if (note >= 0 && note <= 127) {
          this.trigger("noteOn", note, 127);
        }
      }
    }
    if ((incrX || incrY) && slot) {
      e.preventDefault();
      this.trigger("tracker-move", incrX, incrY);
    }
  }
}, {
  AZERTYconfig: AZERTYconfig,
  QWERTYconfig: QWERTYconfig
});

}());
