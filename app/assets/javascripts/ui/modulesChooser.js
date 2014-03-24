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

zound.ui.ModulesChooser = Backbone.View.extend({
  className: "modulesChooser",
  initialize: function () {
    this.modules = this.model.map(function (module) {
      var moduleChooser = new zound.ui.ModuleChooser({
        model: module
      });
      moduleChooser.on("select", _.bind(function () {
        this.model.trigger("selectModule", module);
      }, this));
      this.$el.append(moduleChooser.$el);
      return moduleChooser;
    }, this);
  }
});

zound.ui.ModuleChooser = Backbone.View.extend({
  className: "moduleChooser",
  template: _.template('<span class="title"><%= title %></span>'),
  events: {
    "click": "onClick"
  },
  onClick: function (e) {
    this.trigger("select");
  },
  initialize: function () {
    this.$el.html(this.template(this.model.attributes));
  }
});
