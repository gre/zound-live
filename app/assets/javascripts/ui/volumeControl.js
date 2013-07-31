
zound.ui.VolumeControl = Backbone.View.extend({
  tagName: "label",
  className: "volume",
  tmpl: _.template('<i class="icon-volume-down icon-large"></i><input type="range" min=0 max=100 value=100 /><i class="icon-volume-up icon-large"></i>'),
  initialize: function () {
    this.render();
    this.listenTo(this.model, "change:value", function (p, value) {
      this.$input.val(value);
    });
  },
  events: {
    "change input": "onChange"
  },
  onChange: function () {
    this.model.set("value", this.$input[0].value);
  },
  render: function () {
    this.$el.html(this.tmpl());
    this.$input = this.$el.find("input");
    return this;
  }
});
