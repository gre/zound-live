
zound.models.ModuleProperties = Backbone.Collection.extend({
  model: zound.models.ModuleProperty
});

zound.models.ModuleProperty = Backbone.Model.extend({
  initialize: function () {

  }
});

zound.models.ModulePropertyRange = zound.models.ModuleProperty.extend({
  defaults: {
    min: 0,
    max: 1
  },
  initialize: function () {
    
  }
});
