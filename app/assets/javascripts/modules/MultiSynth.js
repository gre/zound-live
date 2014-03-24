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
(function (SynthModule) {

  zound.modules.MultiSynth = SynthModule.extend({
    canConnectTo: function (out) {
      return out.canPlayNote();
    },
    noteOn: function (note, song, time) {
      song.execAtTime(_.bind(function () {
        this.trigger("noteOn");
      }, this), time);
      return this.outputs.map(function (output) {
        return {
          output: output,
          data: output.noteOn(note, song, time)
        };
      });
    },
    noteOff: function (noteDatas, song, time) {
      song.execAtTime(_.bind(function () {
        this.trigger("noteOff");
      }, this), time);
      _.each(noteDatas, function (noteData) {
        noteData.output.noteOff(noteData.data, song, time);
      });
    }
  });

}(zound.models.SynthModule));
