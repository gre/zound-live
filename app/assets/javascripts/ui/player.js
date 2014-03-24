/*
 * This file is part of ZOUND live.
 *
 * Copyright 2014 Zengularity
 *
 * ZOUND live is free software: you can redistribute it and/or modify
 * it under the terms of the AFFERO GNU General Public License as published by
 * the Free Software Foundation.
 *
 * ZOUND live is distributed "AS-IS" AND WITHOUT ANY WARRANTY OF ANY KIND,
 * INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY,
 * NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. See
 * the AFFERO GNU General Public License for the complete license terms.
 *
 * You should have received a copy of the AFFERO GNU General Public License
 * along with ZOUND live.  If not, see <http://www.gnu.org/licenses/agpl-3.0.html>
 */

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
