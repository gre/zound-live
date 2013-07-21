
zound.ui.TrackerIncrement = Backbone.View.extend({
  tagName: "a",
  className: "tracker-increment",
  events: {
    "click": "onClick"
  },
  options: {
    increments: [0,1,2,4,8]
  },
  initialize: function () {
    this.$el.attr("href", "#");
    this.listenTo(this.model, "change:trackerIncrement", this.render);
    this.render();
  },
  getValue: function () {
    return this.model.get("trackerIncrement");
  },
  setValue: function (v) {
    this.model.set("trackerIncrement", v);
  },
  render: function () {
    this.$el.text(this.getValue());
  },
  onClick: function (e) {
    e.preventDefault();
    var increments = this.options.increments;
    var i = (increments.indexOf(this.getValue())+1) % increments.length;
    this.setValue(increments[i]);
  }
});
