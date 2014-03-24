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
(function(){

function modulo (n, l) {
  return (n+l)%l;
}

zound.models.User = Backbone.Model.extend({

  defaults: {
    trackerIncrement: 1
  },

  initialize: function () {
    if (!this.get("color"))
      this.set("color", this.generateColorFromName());
  },

  generateColorFromName: function () {
    return _.reduce(this.id, function (sum, b) { return 13*sum+b.charCodeAt(0) }, 0) % 256;
  },

  moveTrackerSelection: function (incrX, incrY, nbTracks, nbSlots) {
    var slot = this.get('slot');
    if (slot && (incrX || incrY)) {
      var trackNumber = modulo(slot.track+incrX, nbTracks);
      var slotNumber = modulo(slot.slot+incrY, nbSlots);
      this.set("slot", { slot: slotNumber, track: trackNumber });
    }
  },

  moveTo: function (y) {
    var slot = this.get("slot");
    if (slot) {
      this.set("slot", { slot: y, track: slot.track });
    }
  }
});

zound.models.Users = Backbone.Collection.extend({
  model: zound.models.User
});

}());
