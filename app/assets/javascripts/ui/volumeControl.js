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

zound.ui.VolumeControl = Backbone.View.extend({
  id: "volume",
  tagName: "label",
  className: "volume",
  tmpl: _.template('<i class="icon-volume-down icon-large"></i><input type="range" min=0 max=100 value=100 /><i class="icon-volume-up icon-large"></i>'),
  initialize: function () {
    this.render();
    this.listenTo(this.model, "change:value", function (p, value) {
      this.$input.val(value);
    });
  },
  events: {
    "change input": "onChange"
  },
  onChange: function () {
    this.model.set("value", this.$input[0].value);
  },
  render: function () {
    this.$el.html(this.tmpl());
    this.$input = this.$el.find("input");
    zound.models.MIDIController.makeAssignable(this.$el, _.bind(function (midiValue) {
      this.model.set("value", 100*midiValue/127);
    }, this));
    return this;
  }
});
