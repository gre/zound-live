
zound.models.Pattern = Backbone.Model.extend({
  defaults: {
    length: 32
  },
  initialize: function () {
    this.tracks = new zound.models.Tracks(_.chain(_.range(0, 20)).map(function (num) {
      return new zound.models.Track({
        length: this.get("length"),
        num: num
      });
    }, this).value());
  }
});

zound.models.Patterns = Backbone.Collection.extend({
  model: zound.models.Pattern
});
