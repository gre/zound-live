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
      this.trigger("unselectModule", this.selectedModule);
      this.selectedModule = null;
    }
    if (module) {
      this.selectedModule = module;
      this.trigger("selectModule", module);
    }
  },

  render: function(){
    var g = this.draw(this.model.modules.models);
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
      .data(data, get('id'))
      .enter();
    // connections
    var cs = _.flatten(
      _.map(data, function(m){
        return _.map(m.outputs.models, function(o){
          return [m, o];
        });
      }), true);

    svg.selectAll('line')
      .data(cs)
      .enter()
      .append("svg:line")
      .attr("stroke-width", 2)
      .attr("stroke", "#bfcbdb")
      .attr("x1", function(m) { return m[0].get('x'); })
      .attr("y1", function(m) { return m[0].get('y'); })
      .attr("x2", function(m) { return m[1].get('x'); })
      .attr("y2", function(m) { return m[1].get('y'); });

    var g = e
      .append("svg:g")
      .attr('id', get('id'));
    // outer circle
    g.append('svg:circle')
      .attr('class', 'outer')
      .attr("cx", get('x'))
      .attr("cy", get('y'))
      .attr("r", function(d){ return d.get('w') / 2 + options.margin; })
      .attr("fill", "#f3f9ff")
      .attr("stroke-width", 10)
      .attr("stroke", "#bfcbdb");
    // center circle
    g.append('svg:circle')
      .attr("cx", get('x'))
      .attr("cy", get('y'))
      .attr("r", function(d){ return d.get('w') / 2; })
      .attr("fill", "#314355")
      .attr("stroke-width", 0);
    // title
    g.append("svg:text")
      .attr("x", get('x'))
      .attr("y", get('y'))
      .attr("fill", '#fff')
      .attr("font-family", "monospace")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle")
      .text(get('title'));
    // id
    g.append("svg:text")
      .attr("x", get('x'))
      .attr("y", function(d){ return d.get('y') + 10; })
      .attr("fill", "#fff")
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-size", "8px")
      .text(get('id'));

    return g;
  }

});
