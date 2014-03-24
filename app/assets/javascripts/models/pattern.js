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

zound.models.Pattern = Backbone.Model.extend({
  defaults: {
    length: 32
  },
  initialize: function () {
    this.tracks = new zound.models.Tracks();
  },
  getSlot: function (track, slot) {
    return this.tracks.get(track).slots.get(slot);
  }
});

zound.models.Patterns = Backbone.Collection.extend({
  model: zound.models.Pattern
});
