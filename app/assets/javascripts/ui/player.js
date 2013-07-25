
zound.ui.Player = Backbone.View.extend({
  tagName: "span",
  id: "controls",
  tmpl: _.template('<span id="controls"><a href="#"><i class="icon-play play"></i></a><a href="#"><i class="icon-stop stop"></i></a></span>'),
  initialize: function () {
    this.render();
  },
  events: {
    "click .play": "onPlay",
    "click .stop": "onStop"
  },
  render: function () {
    this.$el.html(this.tmpl());
    return this;
  },
  onPlay: function (e) {
    e.preventDefault();
    this.model.play();
  },
  onStop: function (e) {
    e.preventDefault();
    this.model.stop();
  }
});
