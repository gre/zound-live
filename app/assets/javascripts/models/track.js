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

zound.models.Track = Backbone.Model.extend({
  defaults: {
    length: 32, // This should stay immutable once setted
    offmode: null // contains the name of the guy who controls the offmode
  },
  initialize: function () {
    this.slots = new zound.models.Slots(_.chain(_.range(0, this.get("length"))).map(function (num) {
      return new zound.models.Slot({
        id: num
      });
    }, this).value());

  },
  isListenableFor: function (user) {
    var offmode = this.get("offmode");
    return offmode===null || offmode===user.id;
  }
});

zound.models.Tracks = Backbone.Collection.extend({
  model: zound.models.Track
});
