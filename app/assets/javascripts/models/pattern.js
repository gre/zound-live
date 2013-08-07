
zound.models.Pattern = Backbone.Model.extend({
  defaults: {
    length: 32
  },
  initialize: function () {
    this.tracks = new zound.models.Tracks();
  },
  getSlot: function (track, slot) {
    return this.tracks.get(track).slots.get(slot);
  }
});

zound.models.Patterns = Backbone.Collection.extend({
  model: zound.models.Pattern
});
