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
(function (Module) {

zound.modules.Output = Module.extend({
  canPlugTo: function (out) {
    return false;
  },
  canHaveOutputs: function () {
    return false;
  },
  canPlayNote: function () {
    return false;
  },
  initialize: function () {
    Module.prototype.initialize.call(this);
    // N.B.: this property is not exposed and shared. don't put it in properties.
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, value: 100, title: "Volume" })
  },
  init: function (song) {
    Module.prototype.init.apply(this, arguments);
    this.gain = song.ctx.createGain();
    this.gain.connect(song.ctx.destination);
    this.updateGain();
    this.pVolume.on("change", _.bind(this.updateGain, this));
    this.input = this.gain;
    this.output = this.gain;
  },
  updateGain: function () {
    this.gain.gain.value = this.pVolume.getPercent();
  },
  plugInput: function (nodeInput, song) {
    nodeInput.connect(this.input);
    this.connect(this.output, song);
  },
  unplugInput: function (nodeInput, song) {
    nodeInput.disconnect(this.input);
    this.disconnect(nodeInput);
  }
});

}(zound.models.Module));

