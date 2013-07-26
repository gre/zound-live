
zound.ui.ModulesChooser = Backbone.View.extend({
  className: "modulesChooser",
  initialize: function () {
    this.modules = this.model.map(function (module) {
      var moduleChooser = new zound.ui.ModuleChooser({
        model: module
      });
      this.$el.append(moduleChooser.$el);
      return moduleChooser;
    }, this);
  }
});

zound.ui.ModuleChooser = Backbone.View.extend({
  className: "moduleChooser",
  template: _.template('<span class="title"><%= title %></span>'),
  initialize: function () {
    this.$el.html(this.template(this.model.attributes));
  }
});
