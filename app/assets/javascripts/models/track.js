
zound.models.Track = Backbone.Model.extend({
  defaults: {
    length: 32,
    offmode: null // contains the name of the guy who controls the offmode
  },
  initialize: function () {
    this.slots = new zound.models.Slots(_.chain(_.range(0, this.get("length"))).map(function () {
      return new zound.models.Slot({});
    }, this).value());

  },
  addNote: function (position, note, module) {
    var slot = this.slots.at(position);
    slot.set({ note: note, module: module });
  },
  removeNote: function (position) {
    var slot = this.slots.at(position);
    slot.set({ note: null, module: null });
  },
  isListenableFor: function (user) {
    var offmode = this.get("offmode");
    return offmode===null || offmode===user.get("name");
  }
});

zound.models.Tracks = Backbone.Collection.extend({
  model: zound.models.Track
});
