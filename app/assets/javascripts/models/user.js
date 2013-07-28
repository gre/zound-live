
zound.models.User = Backbone.Model.extend({

  defaults: {
    trackerIncrement: 1
  },

  initialize: function () {
    if (!this.get("color"))
      this.set("color", this.generateColorFromName());
  },

  generateColorFromName: function () {
    return _.reduce(this.id, function (sum, b) { return 13*sum+b.charCodeAt(0) }, 0) % 256;
  },

  getSelectedSlot: function () {
    return this.currentTrackerSlot;
  },

  modulo: function (n, l) {
    return (n+l)%l;
  },

  moveTrackerSelection: function (incrX, incrY) {
    var slot = this.getSelectedSlot();
    if (slot && (incrX || incrY)) {
      var track = slot.track;
      var slotNumber = track.slots.indexOf(slot);
      var tracker = track.tracker;
      var trackNumber = tracker.tracks.indexOf(track);
      trackNumber = this.modulo(trackNumber+incrX, tracker.tracks.length);
      var newTrack = tracker.tracks[trackNumber] || track;
      slotNumber = this.modulo(slotNumber+incrY, newTrack.slots.length);
      var newSlot = newTrack.slots[slotNumber] || slot;
      if (newTrack !== track || newSlot !== slot) {
        CURRENT_USER.selectTrackerSlot(newSlot);
      }
    }
  },

  moveTo: function(y) {
    var slot = this.getSelectedSlot();
    if (slot && y) {
      var track = slot.track;
      var tracker = track.tracker;
      var trackNumber = tracker.tracks.indexOf(track);
      var newTrack = tracker.tracks[trackNumber] || track;
      slotNumber = this.modulo(y, newTrack.slots.length);
      var newSlot = newTrack.slots[slotNumber] || slot;
      if (newTrack !== track || newSlot !== slot) {
        CURRENT_USER.selectTrackerSlot(newSlot);
      }
    }
  },

  selectTrackerSlot: function (view) {
    if (this.currentTrackerSlot) {
      this.unselectCurrentTrackerSlot();
    }
    view.$el.attr("user-select", this.id);
    var track = view.track;
    var slotNumber = track.slots.indexOf(view);
    var tracker = track.tracker;
    var trackNumber = tracker.tracks.indexOf(track);
    this.trigger("user-select-slot", slotNumber, trackNumber);
    this.currentTrackerSlot = view;
  },

  unselectCurrentTrackerSlot: function () {
    var view = this.currentTrackerSlot;
    if (view) {
      view.$el.removeAttr("user-select");
      this.currentTrackerSlot = null;
      this.trigger("user-unselect-slot");
    }
  },

  getCurrentModule: function () {
    return this.currentModule;
  },

  selectModule: function (model) {
    if (this.currentModule) {
      this.unselectModule();
    }
    model.trigger("user-select", this.id);
    this.currentModule = model;
  },

  unselectModule: function () {
    var model = this.currentModule;
    if (model) {
      model.trigger("user-unselect", this.id);
      this.currentModule = null;
    }
  }

});

zound.models.Users = Backbone.Collection.extend({
  model: zound.models.User
});
