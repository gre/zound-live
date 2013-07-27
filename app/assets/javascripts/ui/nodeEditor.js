zound.ui.NodeEditor = Backbone.View.extend({
  options: {
    w: 700,
    h: 380
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
    this.svg = d3.select("#node-editor").append("svg")
      .attr("width", this.options.w)
      .attr("height", this.options.h);
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
      this.selectedModule.set('isSelected', false);
      this.trigger("unselectModule", this.selectedModule);
      this.selectedModule = null;
    }
    if (module) {
      this.selectedModule = module;
      module.set('isSelected', true);
      this.trigger("selectModule", module);
    }
  },

  render: function(){
    var editor = this,
        g = this.draw(this.model.modules.models);

    g.on('click', function(d){
      editor.selectModule(d);
    });
  },

  draw: function (data) {
    var svg = this.svg,
      options = {
        margin: 15
      };

    var get = function(k){
      return function(m){ return m.get(k); };
    };

    var e = svg
      .selectAll("g")
      .data(data, get('id'));
    e.exit().remove();

    // connections
    var cs = _.flatten(
      _.map(data, function(m){
        return _.map(m.outputs.models, function(o){
          return [m, o];
        });
      }), true);
    var lines = svg.selectAll('line').data(cs);
    lines.enter().append("svg:line");
    lines.attr("stroke-width", 2)
      .attr("stroke", "#bfcbdb")
      .attr("x1", function(m) { return m[0].get('x'); })
      .attr("y1", function(m) { return m[0].get('y'); })
      .attr("x2", function(m) { return m[1].get('x'); })
      .attr("y2", function(m) { return m[1].get('y'); });
    lines.exit().remove();

    // groups
    var g = e.enter()
      .append("svg:g")
      .attr('id', get('id'));

    // outer circle
    g.append('svg:circle')
      .attr('class', 'outer')
      .attr("fill", "#f3f9ff")
      .attr("stroke-width", 10);
    e.select('.outer')
      .attr("cx", get('x'))
      .attr("cy", get('y'))
      .attr("r", function(d){ return d.get('w') / 2 + options.margin; })
      .attr("stroke", function(m) { return m.get('isSelected') ? '#79838e' : '#bfcbdb'; });

    // center circle
    g.append('svg:circle')
      .attr('class', 'inner')
      .attr("fill", "#314355")
      .attr("stroke-width", 0);
    e.select('.inner')
      .attr("cx", get('x'))
      .attr("cy", get('y'))
      .attr("r", function(d){ return d.get('w') / 2; });

    // title
    g.append("svg:text")
      .attr('class', 'title')
      .attr("fill", '#fff')
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
    e.select('.title')
      .attr("x", get('x'))
      .attr("y", get('y'))
      .text(get('title'));

    // id
    g.append("svg:text")
      .attr('class', 'id')
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-size", "8px");
    e.select('.id')
      .attr("x", get('x'))
      .attr("y", function(d){ return d.get('y') + 10; })
      .text(get('id'));

    return g;
  }

});
