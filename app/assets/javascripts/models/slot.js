
zound.models.Slot = Backbone.Model.extend({
  defaults: {
    typ: "blank"
  },
  initialize: function () {

  },
  setNote: function (note, moduleId) {
    this.set({ typ: "note", note: note, module: moduleId });
  },
  setOff: function () {
    this.set({ typ: "off", note: null, module: null });
  },
  setBlank: function () {
    this.set({ typ: "blank", note: null, module: null });
  }
});

zound.models.Slots = Backbone.Collection.extend({
  mode: zound.models.Slot
});
