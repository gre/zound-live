
zound.ui.ModulePropertyEditor = Backbone.View.extend({
  tagName: 'li',
  DENSITY: 1000,
  initialize: function () {
    this.render();
  },
  template: _.template('<span class="title"><%= title %></span><div class="component"></div>'),
  render: function() {
    // FIXME We use an input[type=range] for quick impl. - this can be replaced in the future.
    this.$el.html(this.template(this.model.attributes));
    this.$component = this.$el.find(".component");
    var value = Math.round(this.DENSITY*this.model.getPercent());
    var $valueText = $('<span class="valueText">'+this.model.getText()+'</span>');
    var $range = $('<input type="range" min="0" max="'+this.DENSITY+'" value="'+value+'" />');
    $range.on("change", _.bind(function (e) {
      this.model.setPercent(parseInt($range.val())/this.DENSITY);
      $valueText.text(this.model.getText());
    }, this));
    this.$component.append($valueText);
    this.$component.append($range);
    return this;
  }
});

zound.ui.ModulePropertiesEditor = Backbone.View.extend({
  tagName: 'div',

  initialize: function () {
    this.init();
    this.listenTo(this.model, "change", this.render);
    this.render();
  },

  init: function () {
    console.log("TODO: init module properties view", this.model);
    var $title = $('<h3/>');
    $title.text(this.model.get("title"));
    var $ul = $('<ul/>');
    this.model.properties.each(function (property) {
      var propertyView = new zound.ui.ModulePropertyEditor({
        model: property
      });
      $ul.append(propertyView.el);

      this.$el.append($title);
      this.$el.append($ul);
    }, this);
  },

  render: function () {

  }
});
