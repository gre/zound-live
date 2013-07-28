(function(){

function modulo (n, l) {
  return (n+l)%l;
}

zound.models.User = Backbone.Model.extend({

  defaults: {
    trackerIncrement: 1
  },

  initialize: function () {
    if (!this.get("color"))
      this.set("color", this.generateColorFromName());
  },

  generateColorFromName: function () {
    return _.reduce(this.id, function (sum, b) { return 13*sum+b.charCodeAt(0) }, 0) % 256;
  },

  moveTrackerSelection: function (incrX, incrY, nbTracks, nbSlots) {
    var slot = this.get('slot');
    if (slot && (incrX || incrY)) {
      var trackNumber = modulo(slot.track+incrX, nbTracks);
      var slotNumber = modulo(slot.slot+incrY, nbSlots);
      this.set("slot", { slot: slotNumber, track: trackNumber });
    }
  },

  moveTo: function (y) {
    var slot = this.get("slot");
    if (slot) {
      this.set("slot", { slot: y, track: slot.track });
    }
  }
});

zound.models.Users = Backbone.Collection.extend({
  model: zound.models.User
});

}());
