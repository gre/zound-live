
zound.ui.ModulesChooser = Backbone.View.extend({
  className: "modulesChooser",
  initialize: function () {
    this.modules = this.model.map(function (module) {
      var moduleChooser = new zound.ui.ModuleChooser({
        model: module
      });
      moduleChooser.on("select", _.bind(function () {
        this.model.trigger("selectModule", module);
      }, this));
      this.$el.append(moduleChooser.$el);
      return moduleChooser;
    }, this);
  }
});

zound.ui.ModuleChooser = Backbone.View.extend({
  className: "moduleChooser",
  template: _.template('<span class="title"><%= title %></span>'),
  events: {
    "click": "onClick"
  },
  onClick: function (e) {
    this.trigger("select");
  },
  initialize: function () {
    this.$el.html(this.template(this.model.attributes));
  }
});
