
zound.models.Song = Backbone.Model.extend({
  defaults: {
    bpm: 125
  },
  initialize: function () {
    this.patterns = new zound.models.Patterns();
    this.modules = new zound.models.Modules();
  }
});
