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

zound.ui.TrackerIncrement = Backbone.View.extend({
  tagName: "a",
  className: "tracker-increment",
  events: {
    "click": "onClick"
  },
  options: {
    increments: [0,1,2,4,8]
  },
  initialize: function () {
    this.$el.attr("href", "#");
    this.listenTo(this.model, "change:trackerIncrement", this.render);
    this.render();
  },
  getValue: function () {
    return this.model.get("trackerIncrement");
  },
  setValue: function (v) {
    this.model.set("trackerIncrement", v);
  },
  render: function () {
    this.$el.text(this.getValue());
  },
  onClick: function (e) {
    e.preventDefault();
    var increments = this.options.increments;
    var i = (increments.indexOf(this.getValue())+1) % increments.length;
    this.setValue(increments[i]);
  }
});
