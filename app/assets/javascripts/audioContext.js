
zound.createAudioContext = function (options) {
  var ctx = new webkitAudioContext();
  // Seems to be a weird bug in ctx if never start an osc == never start ctx.currentTime.
  var osc = ctx.createOscillator();
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + 0.001);
  return ctx;
};

// An AudioContext not used for real but just to explore values of different components
zound.dummyAudioContext = zound.createAudioContext();
