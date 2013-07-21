
zound.models.PlayerController = Backbone.Model.extend({
  defaults: {
  },

  initialize: function () {
  	this.lookAhead = 25; // Call shedule every ms
  	this.scheduleAhead = 0.1; // Audio schedule (sec)
  	this.nextLineTime = 0;
  	this.playing = false;
  	this.timerId = null;
  	this.currentLine = 0;
  },

  setSong: function(song) {
  	this.set("song", song);
  },

  play: function () {
  	this.playing = true;
  	this.currentLine = 0;
  	this.nextLineTime = ctx.currentTime;
  	this.scheduler();
  },

  stop: function () {
  	this.playing = false;
  	window.clearTimeout(this.timerID);
  },

  scheduler: function () {
  	while (this.nextLineTime < ctx.currentTime + this.scheduleAhead) {
  	  this.scheduleNote(this.currentLine, this.nextLineTime);
  	  this.nextNote();
  	}
  	var self = this,
  		timerId = window.setTimeout(function () {
  			self.scheduler();
  		}, this.lookAhead);
  	this.timerId = timerId;
  },

  nextNote: function() {
  	var pattern = this.get("song").patterns.models[0],
  			secondsPerBeat = 60.0 / this.get("song").get("bpm");
		this.nextLineTime = this.nextLineTime + 0.25 * secondsPerBeat;

		this.currentLine = this.currentLine + 1;
		if (this.currentLine == pattern.get("length")) {
			this.currentLine = 0;
		}
	},

	scheduleNote: function(lineNumber, time) {
		var pattern = this.get("song").patterns.models[0],
				notes = [];

		for (var i = 0; i < 3; i++) {
			notes[i] = pattern.tracks.models[i].slots.models[lineNumber].get("note");

			if (notes[i]) {
				var osc = ctx.createOscillator();
				osc.type = i;
				osc.connect(ctx.destination);
				osc.frequency.value = 220 + (notes[i] * 5);
				osc.start(time);
				osc.stop(time + 0.05);
			}
		}
	}
});


