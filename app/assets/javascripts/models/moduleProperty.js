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

// TODO : BooleanProperty

zound.models.ModuleProperty = Backbone.Model.extend({
  initialize: function () {
    if (!this.get("id")) this.set("id", this.cid);
  },
  setPercent: function (percent) {
    this.set("value", percent);
  },
  getPercent: function () {
    return this.get("value");
  },
  getValue: function () {
    return this.get("value");
  },
  getText: function () {
    return this.get("value");
  },
  getValueGranularity: function () {
    return Infinity;
  }
});

zound.models.ModulePropertyRange = zound.models.ModuleProperty.extend({
  defaults: {
    min: 0,
    max: 1,
    value: 0,
    round: true,
    title: "no title",
    curve: "linear"
  },
  initialize: function () {
    zound.models.ModuleProperty.prototype.initialize.apply(this, arguments);
  },
  getCurve: function () {
    return zound.AudioMath.curves[this.get("curve")];
  },
  setPercent: function (percent) {
    var min = this.get("min");
    var max = this.get("max");
    var round = this.get("round");
    var value = min+this.getCurve().fun(percent)*(max-min);
    this.set("value", round ? Math.round(value) : value);
  },
  getPercent: function () {
    var value = this.get("value");
    var min = this.get("min");
    var max = this.get("max");
    return this.getCurve().inv((value-min)/(max-min));
  },
  getText: function () {
    var value = this.get("value");
    return this.get("round") ? value : value.toFixed(2);
  },
  getValueGranularity: function () {
    return this.get("round") && this.get("curve")==="linear" ? this.get("max")-this.get("min") : Infinity;
  }
});

zound.models.ModulePropertySelect = zound.models.ModuleProperty.extend({
  defaults: {
    values: ["off", "on"],
    value: 0,
    title: "no title"
  },
  initialize: function () {
    zound.models.ModuleProperty.prototype.initialize.apply(this, arguments);
  },
  setPercent: function (percent) {
    var values = this.get("values");
    var value = Math.round(percent*(values.length-1));
    this.set("value", value);
  },
  getPercent: function () {
    var values = this.get("values");
    var value = this.get("value");
    return value / (values.length-1);
  },
  getText: function () {
    var values = this.get("values");
    return values[this.get("value")];
  },
  getValueGranularity: function () {
    return this.get("values").length-1;
  }
});

zound.models.ModuleProperties = Backbone.Collection.extend({
  model: zound.models.ModuleProperty
});

