
zound.ui.NodeEditor = Backbone.View.extend({
  w: 700,
  h: 400,
  initialize: function () {
    this.init();
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.modules, "change", this.render);
    this.listenTo(this.model.modules, "add", this.render);
    this.listenTo(this.model.modules, "remove", this.render);
    this.render();
  },

  init: function () {
    this.paper = Raphael(this.el, this.w, this.h);
  },

  render: function () {
    var paper = this.paper;

    var W = this.w;
    var H = this.h;

    // FIXME: always redraw everything, this need to be optimized
    //paper.clear();

    // draw links
    this.model.modules.each(function (module) {
      var startx = module.get("x") + module.get("w") / 2;
      var starty = module.get("y") + module.get("h") / 2;

      // FIXME, the connect lines are not supporting new connections yet
      if (!module.$outputs) {
        module.$outputs = module.outputs.map(function (out) {
          var endx = out.get("x") + out.get("w") / 2;
          var endy = out.get("y") + out.get("h") / 2;
          var path = paper.path("M"+startx+" "+starty+"L"+endx+" "+endy);
          path.attr("stroke", "#fff");
          path.attr("stroke-width", 2);
          return path;
        });
      }
      else {
        _.each(_.zip(module.outputs.models, module.$outputs), function (o) {
          var out = o[0];
          var path = o[1];
          var endx = out.get("x") + out.get("w") / 2;
          var endy = out.get("y") + out.get("h") / 2;
          path.attr("path", "M"+startx+" "+starty+"L"+endx+" "+endy);
        });
      }
    });

    // draw modules
    this.model.modules.each(function (module) {
      if (!module.$box) {
        var x = module.get("x");
        var y = module.get("y");
        var w = module.get("w");
        var h = module.get("h");
        var title = module.get("title");

        var box = paper.rect(0, 0, w, h);
        box.attr("fill", "#f00");
        box.attr("stroke", "#fff");

        var titleText = paper.text(w/2, 10, title);
        titleText.attr("fill", "#fff");

        var all = paper.set();
        all.push(box, titleText);
        all.transform("t"+[x,y]);

        // Handle drag of a module
        (function (startX, startY) {
          box.drag(function (dx, dy) {
            x = Math.min(Math.max(startX + dx, 0), W-w);
            y = Math.min(Math.max(startY + dy, 0), H-h);
            module.set({ x: x, y: y });
            all.transform("t"+[x, y]);
          }, function () {
            startX = x;
            startY = y;
          }, function () {
            module.set({ x: x, y: y });
          });
        }(x, y));

        module.$box = box;
      }
    });
    
  }
});
