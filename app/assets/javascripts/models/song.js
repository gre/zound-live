
zound.models.Song = Backbone.Model.extend({
  defaults: {
    bpm: 125
  },
  initialize: function () {
    //this.pattern = new zound.models.Pattern();
    this.modules = new zound.models.Modules();
  }
});
