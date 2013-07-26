

zound.ui.NodeEditor = Backbone.View.extend({
  options: {
    w: 700,
    h: 130
  },
  initialize: function () {
    this.init();
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.modules, "change", this.render);
    this.listenTo(this.model.modules, "add", function (module) {
      this.listenModule(module);
      this.render();
    });
    this.listenTo(this.model.modules, "remove", this.onModuleRemove);
    this.model.modules.each(this.listenModule, this);
    this.render();
  },

  listenModule: function (module) {
    this.listenTo(module, "change", this.render);
    this.listenTo(module.outputs, "add", this.render);
    this.listenTo(module.outputs, "remove", this.render);
  },

  init: function () {
    this.paper = Raphael(this.el, this.options.w, this.options.h);
  },

  onModuleRemove: function (module) {
    if (module.$box) {
      module.$box.remove();
      this.render();
    }
  },

  selectModule: function (module) {
    if (module === this.selectedModule) return;
    if (this.selectedModule) {
      this.trigger("unselectModule", this.selectedModule);
      this.selectedModule = null;
    }
    if (module) {
      this.selectedModule = module;
      this.trigger("selectModule", module);
    }
  },

  // FIXME TODO: split into multiple function for a better event binding
  // we need to avoid always redrawing everything for performance
  //
  render: function () {
    var self = this;
    var paper = this.paper;

    var W = this.options.w;
    var H = this.options.h;

    var MARGIN_CIRCLE = 15;

    // draw links
    this.model.modules.each(function (module) {
      var startx = module.get("x");
      var starty = module.get("y");

      // FIXME, the connect lines are not supporting new connections yet
      //if (!module.$outputs) {
      if (module.$outputs) {
        _.each(module.$outputs, function (path) {
          path.remove();
        });
      }
        module.$outputs = module.outputs.map(function (out) {
          var endx = out.get("x");
          var endy = out.get("y");
          var path = paper.path("M"+startx+" "+starty+"L"+endx+" "+endy);
          path.attr("stroke", "#bfcbdb");
          path.attr("stroke-width", 2);
          path.toBack();
          return path;
        });
      /*}
      else {
        _.each(_.zip(module.outputs.models, module.$outputs), function (o) {
          var out = o[0];
          var path = o[1];
          var endx = out.get("x");
          var endy = out.get("y") + out.get("h");
          path.attr("path", "M"+startx+" "+starty+"L"+endx+" "+endy);
        });
      }*/
    });

    // draw modules
    this.model.modules.each(function (module) {
      if (!module.$box) {
        var x = module.get("x");
        var y = module.get("y");
        var w = module.get("w");

        var all = paper.set();

        var bg = paper.circle(0, 0, w / 2 + MARGIN_CIRCLE);
        bg.attr("fill", "#f3f9ff");
        bg.attr("stroke-width", 10);
        bg.attr("stroke", "#bfcbdb");

        var box = paper.circle(0, 0, w / 2);
        box.attr("fill", "#314355");
        box.attr("stroke-width", 0);

        var titleText = paper.text(0, -3, module.get("title"));
        titleText.attr("fill", "#fff");

        var numberText = paper.text(5, 7, module.getDisplayId());
        numberText.attr("fill", "#fff");
        numberText.attr("text-anchor", "end");
        numberText.attr("font-family", "monospace");
        numberText.attr("font-weight", "bold");

        all.push(box, titleText, numberText, bg);

        module.on("user-select", function (name) {
          bg.attr("stroke", "#79838e");
        });
        module.on("user-unselect", function (name) {
          bg.attr("stroke", "#bfcbdb");
        });

        // Handle drag of a module
        (function (startX, startY) {
          var draggable = paper.set(box, titleText);
          draggable.attr("cursor", "move");
          draggable.drag(function (dx, dy) {
            x = Math.min(Math.max(startX + dx, 0), W-w);
            y = Math.min(Math.max(startY + dy, 0), H-w);
            module.set({ x: x, y: y });
            all.transform("t"+[x, y]);
          }, function () {
            startX = x;
            startY = y;
            self.selectModule(module);
          }, function () {
            module.set({ x: x, y: y });
          });
        }(x+w/2, y+w/2));

        // Handle for connecting with the dot
        module.canHaveOutputs() && (function (startx, starty, endx, endy) {

          var outputDotPath = paper.path("");
          all.push(outputDotPath);

          outputDotPath.attr("stroke", "#bfcbdb");
          outputDotPath.attr("stroke-dasharray", "- ");
          outputDotPath.attr("stroke-width", 2);
          outputDotPath.toFront();

          bg.drag(function (dx, dy, mx, my, e) {
            var bbox = all.getBBox(),
                realMouseX = e.offsetX,
                realMouseY = e.offsetY;
            endx = realMouseX;
            endy = realMouseY;
            outputDotPath.attr("path", "M"+0+" "+0+"L"+endx+" "+endy);
          }, function (sx, sy) {
          }, function () {
            outputDotPath.attr("path", "");
            var px = module.get("x")+endx;
            var py = module.get("y")+endy;
            var out = self.model.modules.find(function (m) {
              if (m.get("x") < px && px < m.get("x")+m.get("w") &&
                  m.get("y") < py && py < m.get("y")+m.get("w")) {
                    return m.canHaveInputs();
                  }
            });
            if (out && module !== out) {
              if (module.outputs.contains(out))
                module.disconnect(out);
              else
                module.connect(out);
            }
          });
        }(0, 0));

        // Set initial position
        all.transform("t"+[x,y]);

        // Save for cache
        module.$box = all;
      }
    });

  }
});
