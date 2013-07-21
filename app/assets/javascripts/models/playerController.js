(function (models, modules, ui) {

  var playing = false,
      timerID = null,
      nextLineTime = null,
      tempo = 70,
      lookAhead = 25,  //How frequently to call scheduling  (ms)
      scheduleAheadTime = 0.1, // How far ahead to schedule audio (sec)
      currentLine,
      ctx = new webkitAudioContext();

  function scheduler() {
    while (nextLineTime < ctx.currentTime + scheduleAheadTime) {
      scheduleNote(currentLine, nextLineTime);
      nextNote();
    }
    timerID = window.setTimeout(scheduler, lookAhead);
  }

  function nextNote() {
    // Advance current note and time by a 16th note...
    var secondsPerBeat = 60.0 / tempo;
    nextLineTime += 0.25 * secondsPerBeat;

    currentLine++;
    if (currentLine == 32) {
        currentLine = 0;
    }
  }

  function scheduleNote(beatNumber, time) {

    var osc = ctx.createOscillator();
    osc.connect(ctx.destination);
    osc.frequency.value = beatNumber % 4 === 0 ? 440.0 : 220.0;
    osc.start(time);
    osc.stop(time + 0.05);

  }

  window.player = {

    ctx: ctx,

    play: function () {

      playing = true;
      currentLine = 0;
      nextLineTime = ctx.currentTime;
      scheduler();

    },

    stop: function () {

      playing = false;
      window.clearTimeout(timerID);

    }

  }

}(zound.models, zound.modules, zound.ui));
