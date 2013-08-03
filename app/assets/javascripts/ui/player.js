
zound.ui.Player = Backbone.View.extend({
  tagName: "span",
  id: "controls",
  tmpl: _.template('<span id="controls">'+
    '<a href="#" id="player-stop" class="stop"><i class="icon-stop"></i></a>'+
    '<a href="#" id="player-play" class="play"><i class="icon-play"></i></a>'+
    '<a href="#" id="player-record" class="record"><i class="icon-circle"></i></a>'+
    '</span>'),
  initialize: function () {
    this.listenTo(this.model, "change:recording", this.syncRecord);
    this.render();
    this.syncRecord();
  },
  events: {
    "click .play": "onPlay",
    "click .stop": "onStop",
    "click .record": "onRecord"
  },
  syncRecord: function () {
    this.$el.find(".record").toggleClass("recording", this.model.get("recording"));
  },
  render: function () {
    this.$el.html(this.tmpl());
    zound.models.MIDIController.makeAssignable(this.$el.find(".play"), _.bind(function (midiValue) {
      if (midiValue > 63) {
        if (!this.model.get("playing")) {
          this.model.play();
        }
      }
    }, this));

    zound.models.MIDIController.makeAssignable(this.$el.find(".stop"), _.bind(function (midiValue) {
      if (midiValue > 63) {
        this.model.stop();
      }
    }, this));

    zound.models.MIDIController.makeAssignable(this.$el.find(".record"), _.bind(function (midiValue) {
      if (midiValue > 63) {
        this.model.record();
      }
    }, this));
    return this;
  },
  onPlay: function (e) {
    e.preventDefault();
    this.model.play();
  },
  onStop: function (e) {
    e.preventDefault();
    this.model.stop();
  },
  onRecord: function (e) {
    e.preventDefault();
    this.model.record();
  }
});
