
zound.models.Track = Backbone.Model.extend({
  defaults: {
    length: 32,
    offmode: null // contains the name of the guy who controls the offmode
  },
  initialize: function () {
    this.slots = new zound.models.Slots(_.chain(_.range(0, this.get("length"))).map(function (num) {
      return new zound.models.Slot({
        num: num
      });
    }, this).value());

  },
  isListenableFor: function (user) {
    var offmode = this.get("offmode");
    return offmode===null || offmode===user.id;
  }
});

zound.models.Tracks = Backbone.Collection.extend({
  model: zound.models.Track
});
