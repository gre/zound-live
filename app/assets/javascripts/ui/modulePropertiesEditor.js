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

zound.ui.ModulePropertyEditor = Backbone.View.extend({
  tagName: 'li',
  initialize: function () {
    this.render();
    this.listenTo(this.model, "change:value", this.onValueChange);
  },
  template: _.template('<span class="title"><%= title %></span><div class="component"></div>'),
  render: function() {
    this.$el.attr("id", this.model.cid);
    // FIXME We use an input[type=range] for quick impl. - this can be replaced in the future.
    var granularity = this.model.getValueGranularity();
    if (!isFinite(granularity)) granularity = 1000;
    this.$el.html(this.template(this.model.attributes));
    this.$component = this.$el.find(".component");
    var value = Math.round(granularity*this.model.getPercent());
    this.$valueText = $('<span class="valueText">'+this.model.getText()+'</span>');
    this.$range = $('<input type="range" min="0" max="'+granularity+'" value="'+value+'" />');
    this.$component.append(this.$valueText);
    this.$component.append(this.$range);

    this.$range.on("change", _.bind(function (e) {
      this._dontSetInputValue = true;
      this.model.setPercent(parseInt(this.$range.val())/granularity);
      this._dontSetInputValue = false;
    }, this));

    zound.models.MIDIController.makeAssignable(this.$el, _.bind(function (midiValue) {
      this.model.setPercent(midiValue / 127);
    }, this));
    return this;
  },
  onValueChange: function (model, rawValue) {
    var granularity = model.getValueGranularity();
    var value = Math.round(granularity*model.getPercent());
    if (!this._dontSetInputValue) {
      this.$range.val(value);
    }
    this.$valueText.text(model.getText());
  }
});

zound.ui.ModulePropertiesEditor = Backbone.View.extend({
  tagName: 'div',

  initialize: function () {
    this.init();
    this.listenTo(this.model, "change", this.render);
    this.render();
  },

  init: function () {
    var $title = $('<h3/>');
    $title.text(this.model.get("title"));
    var $ul = $('<ul/>');
    this.model.properties.each(function (property) {
      var propertyView = new zound.ui.ModulePropertyEditor({
        model: property
      });
      $ul.append(propertyView.el);
    }, this);
    this.$el.append($title);
    this.$el.append($ul);
  },

  render: function () {

  }
});
