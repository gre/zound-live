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

zound.AudioMath = (function () {

  // FIXME: check if the 69 is right (it seems SunVox use one octave lower)
  var NOTE_FREQUENCIES = _.map(_.range(0, 128), function (note) {
      return Math.pow(2, (note-69)/12)*440;
  });

  return {
    // see http://en.wikipedia.org/wiki/Note
    noteToFrequency: function (noteValue) {
      return NOTE_FREQUENCIES[noteValue];
    },
    

    curves: {
        linear: {
          fun: function (x) { return x },
          inv: function (y) { return y }
        },
        quad: {
          fun: function (x) { return x*x },
          inv: function (y) { return Math.sqrt(y) }
        },
        quadOut: {
          fun: function (x) { return x*(2-x) },
          inv: function (y) { return 1-Math.sqrt(1-y) }
        },
        quadCenter: {
          fun: function (x) { var a = x-0.5; return (x > 0.5 ? 1 : -1)*2*a*a+0.5 },
          inv: function (y) { var m = y > 0.5 ? 1 : -1; var a = m*(8*y-4); return 0.5+m*0.25*Math.sqrt(a) }
        },
        cubic: {
          fun: function (x) { return x*x*x },
          inv: function (y) { return Math.pow(y, 1/3) }
        }
    }
  };
}());
