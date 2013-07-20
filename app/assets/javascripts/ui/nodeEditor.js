
zound.ui.NodeEditor = Backbone.View.extend({
  initialize: function () {
    // FIXME: this need to be optimized
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.modules, "change", this.render);
    this.listenTo(this.model.modules, "add", this.render);
    this.listenTo(this.model.modules, "remove", this.render);
    this.render();
  },
  
  render: function () {
    console.log("TODO render: ", this.model);
  }
});
