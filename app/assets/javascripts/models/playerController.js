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

zound.models.PlayerController = Backbone.Model.extend({
  defaults: {
    length: 32,
    bpm: 125,
    playing: false,
    recording: false
  },

  initialize: function () {
    this.lookAhead = 25; // Call shedule every ms
    this.scheduleAhead = 0.1; // Audio schedule (sec)
    this.nextLineTime = 0;
    this.timerId = null;
    this.currentLine = 0;
  },

  setAudioContext: function (ctx) {
    this.ctx = ctx;
  },

  play: function () {
    this.trigger("play"); // play button pressed trigger, whatever if already playing
    if (this.get("playing")) return;
    var ctx = this.ctx;
    this.currentLine = 0;
    this.nextLineTime = ctx.currentTime;
    this.scheduler(ctx);
    this.set("playing", true);
  },

  stop: function () {
    this.trigger("stop"); // stop button pressed trigger, whatever if already playing
    if (!this.get("playing")) return;
    window.clearTimeout(this.timerId);
    this.set("recording", false);
    this.set("playing", false);
  },

  record: function () {
    this.play();
    this.set("recording", !this.get("recording"));
  },

  scheduler: function (ctx) {
    while (this.nextLineTime < ctx.currentTime + this.scheduleAhead) {
      this.trigger("tick", this.currentLine, this.nextLineTime);
      this.nextLine();
    }
    this.timerId = window.setTimeout(_.bind(this.scheduler, this, ctx), this.lookAhead);
  },

  nextLine: function () {
    var secondsPerBeat = 60.0 / this.get("bpm");
    this.nextLineTime = this.nextLineTime + 0.25 * secondsPerBeat;
    this.currentLine = this.currentLine+1 >= this.get("length") ? 0 : this.currentLine+1;
  }
});


