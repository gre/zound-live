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
