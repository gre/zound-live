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

zound.models.Slot = Backbone.Model.extend({
  defaults: {
    typ: "blank"
  },
  initialize: function () {

  },
  setNote: function (note, moduleId) {
    this.set({ typ: "note", note: note, module: moduleId });
  },
  setOff: function () {
    this.set({ typ: "off", note: null, module: null });
  },
  setBlank: function () {
    this.set({ typ: "blank", note: null, module: null });
  }
});

zound.models.Slots = Backbone.Collection.extend({
  mode: zound.models.Slot
});
