
zound.models.Slot = Backbone.Model.extend({
  defaults: {
    note: null,
    module: null
  },
  initialize: function () {

  }
});

zound.models.Slots = Backbone.Collection.extend({
  mode: zound.models.Slot
});
