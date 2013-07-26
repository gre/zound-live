
zound.ui.NodeEditor = Backbone.View.extend({
  options: {
    w: 700,
    h: 340
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

    // draw links
    this.model.modules.each(function (module) {
      var startx = module.get("x") + module.get("w");
      var starty = module.get("y") + module.get("h");

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
          path.attr("stroke", "#fff");
          path.attr("stroke-width", 1);
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
        var h = module.get("h");

        var all = paper.set();

        var box = paper.rect(0, 0, w, h);
        box.attr("fill", module.get("color"));
        box.attr("stroke-width", 1);
        box.attr("stroke", "#000");

        var titleText = paper.text(w/2, 10, module.get("title"));
        titleText.attr("fill", "#fff");

        var numberText = paper.text(w, -6, module.getDisplayId());
        numberText.attr("fill", "#f0f");
        numberText.attr("text-anchor", "end");
        numberText.attr("font-family", "monospace");
        numberText.attr("font-weight", "bold");

        all.push(box, titleText, numberText);

        module.on("user-select", function (name) {
          box.attr("stroke-width", 2);
          box.attr("stroke", "#f00");
        });
        module.on("user-unselect", function (name) {
          box.attr("stroke-width", 1);
          box.attr("stroke", "#000");
        });

        // Handle drag of a module
        (function (startX, startY) {
          var draggable = paper.set(box, titleText);
          draggable.attr("cursor", "move");
          draggable.drag(function (dx, dy) {
            x = Math.min(Math.max(startX + dx, 0), W-w);
            y = Math.min(Math.max(startY + dy, 0), H-h);
            module.set({ x: x, y: y });
            all.transform("t"+[x, y]);
          }, function () {
            startX = x;
            startY = y;
            self.selectModule(module);
          }, function () {
            module.set({ x: x, y: y });
          });
        }(x, y));

        // Display the dot input
        module.canHaveInputs() && (function (startx, starty, endx, endy) {
          var inputDot = paper.circle(0, 0, 4);
          inputDot.attr("fill", "#fff");
          inputDot.attr("stroke-width", 0);
          all.push(inputDot);
        }());

        // Handle for connecting with the dot
        module.canHaveOutputs() && (function (startx, starty, endx, endy) {
          var outputDot = paper.circle(w+2, h, 8);
          outputDot.attr("fill", "#ccc");
          outputDot.attr("stroke", "#000");
          outputDot.attr("stroke-width", 1);
          var outputDotPath = paper.path("");
          all.push(outputDot, outputDotPath);

          outputDotPath.attr("stroke", "#fff");
          outputDotPath.attr("stroke-dasharray", "- ");
          outputDotPath.attr("stroke-width", 1);
          
          outputDot.drag(function (dx, dy) {
            endx = startx+dx;
            endy = starty+dy;
            outputDotPath.attr("path", "M"+startx+" "+starty+"L"+endx+" "+endy);
          }, function () {
          }, function () {
            outputDotPath.attr("path", "");
            var px = module.get("x")+endx;
            var py = module.get("y")+endy;
            var out = self.model.modules.find(function (m) {
              if (m.get("x") < px && px < m.get("x")+m.get("w") &&
                  m.get("y") < py && py < m.get("y")+m.get("h")) {
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
        }(w+1, h));

        // Set initial position
        all.transform("t"+[x,y]);

        // Save for cache
        module.$box = all;
      }
    });
    
  }
});
