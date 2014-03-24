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

zound.ui.NodeEditor = Backbone.View.extend({
  options: {
    w: 700,
    h: 380,
    // nodes options
    outerCircleWidth: 8,
    margin: 12,
    r: 30,
    refreshRate: 20
  },

  initialize: function () {
    this.init();
    this.listenTo(CURRENT_USER, "change:module", this.render);
    this.listenTo(this.model, "change", this.render);
    this.listenTo(this.model.modules, "change", this.render);
    this.listenTo(this.model.modules, "add", function (module) {
      this.listenModule(module);
      this.render();
    });
    this.listenTo(this.model.modules, "remove", this.render);
    this.model.modules.each(this.listenModule, this);
    this.render();

    var renderTime = 0;
    var renderInterval = 1000 / this.options.refreshRate;
    
    setInterval(_.bind(function(){ this.renderWaveforms() }, this), renderInterval);
    return;
    var loop = _.bind(function () {
      requestAnimationFrame(loop);
      var now = Date.now();
      if (now - renderTime > renderInterval) {
        now = renderTime;
        this.renderWaveforms();
      }
    }, this);
    requestAnimationFrame(loop);
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

  selectModule: function (module) {
    CURRENT_USER.set("module", module.id);
  },

  render: function(){
    var editor = this,
        g = this.draw(this.model.modules.models);
    this.addBehaviours(g);
    return g;
  },

  renderWaveforms: function () {
    var e = this.svg
      .selectAll("g")
      .data(this.model.modules.models, function(m){ return m.get("id"); });
    e.select('.waveform')
      .attr("d", _.bind(this.lineWaveform, this));
  },

  addBehaviours: function(g) {
    var editor = this,
        options = this.options;

    g.on('click', function(d){
      editor.selectModule(d);
    });

    var move = d3.behavior.drag()
      .on('dragstart', function(m) {
        editor.selectModule(m);
      })
      .on("drag", function (module){
        var x = module.get('x'),
            y = module.get('y');
        module
          .set('x', d3.event.dx + x)
          .set('y', d3.event.dy + y);
      });

    // TODO: activate connect when user is holding Command
    var svg = this.svg,
      connect = d3.behavior.drag()
       .on('dragstart', function(module) {
          editor.selectModule(module);
          var x = module.get('x'),
              y = module.get('y');
          svg
            .insert('svg:line', ":first-child")
            .attr('id', 'connectLine')
            .attr("stroke-dasharray", "5, 5")
            .attr("stroke-width", 2)
            .attr("stroke", "#bfcbdb")
            .attr("x1", x)
            .attr("y1", y)
            .attr("x2", x)
            .attr("y2", y);
        })
       .on("drag", function (module){
          svg.select('#connectLine')
            .attr("x2", d3.event.x)
            .attr("y2", d3.event.y);
       })
       .on("dragend", function (module){
          svg.select('#connectLine').remove();

          var pos = d3.mouse(svg.node()),
              px = pos[0],
              py = pos[1];

          var out = editor.model.modules.find(function (m) {
            var x = m.get("x"),
                y = m.get("y"),
                r = options.r;

            return x - r < px &&
                px < x + r &&
                y - r < py &&
                py < y + r &&
                module.canConnectTo(m);
          });

          if (out && module !== out) {
            if (module.outputs.contains(out))
              module.outputs.remove(out);
            else
              module.outputs.add(out);
          }

       });

     g.call(move);

     d3.select("body")
      .on("keydown", function() {
        if(d3.event.metaKey)
          g.call(connect);
      })
      .on('keyup', function() {
        if(!d3.event.metaKey)
          g.call(move);
      });

     return g;
  },

  lineWaveform: function (m) {
    var r = this.options.r;
    var scalex = d3.scale.linear()
      .domain([0, m.samplesLength])
      .range([-r, +r]);

    var scaley = d3.scale.linear()
      .domain([0, 255]) // Uint8
      .range([+r, -r]);

    var line = d3.svg.line()
      .interpolate("linear")
      .x(function(d,i) { return scalex(i); })
      .y(scaley);

    return line(m.getWaveData());
  },

  draw: function (data) {
    var editor = this,
        svg = this.svg,
        options = this.options;

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
    lines.enter().insert("svg:line", 'g');
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
      .attr('class', 'module')
      .attr('id', get('id'))
      .attr("cursor", "pointer");

    e.attr("transform", function (m) { return "translate("+m.get("x")+","+m.get("y")+")" });

    // outer circle
    g.append('svg:circle')
      .attr('class', 'outer')
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "#f3f9ff")
      .attr("stroke-width", options.outerCircleWidth)
      .attr("r",  options.r + options.margin);

    e.select('.outer')
      .attr("stroke", function(m) { return CURRENT_USER.get("module")==m.id ? '#79838e' : '#bfcbdb'; });

    // center circle
    g.append('svg:circle')
      .attr('class', 'inner')
      .attr("cx", 0)
      .attr("cy", 0)
      .attr("fill", "#456")
      .attr("stroke-width", 0)
      .attr("r", options.r);

    g.append("svg:path")
      .attr('class', 'waveform')
      .attr("fill", "transparent")
      .attr("stroke-width", 1)
      .attr("stroke", "rgba(255,255,255,0.4)");

    // Waveform in real time
    e.select('.waveform')
      .attr("d", _.bind(this.lineWaveform, this));

    // title
    g.append("svg:text")
      .attr('class', 'title')
      .attr("x", 0)
      .attr("y", -5)
      .attr("fill", '#fff')
      .attr("font-family", "Open Sans")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
    e.select('.title')
      .text(get('title'));

    // id
    g.append("svg:text")
      .attr('class', 'id')
      .attr("x", 0)
      .attr("y", 10)
      .attr("fill", "#FFD384")
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("font-size", "8px");
    e.select('.id')
      .text(function(m){ return m.getDisplayId(); });

    // note animation
    g.each(function(m){
      var group = d3.select(this),
          inner = group.select('.inner');
      editor.listenTo(m, "noteOn", function(){
        inner.transition()
          .attr("r", options.r+options.margin-options.outerCircleWidth/2)
          .duration(0)
          .transition()
          .attr("r", options.r)
          .duration(200)
      });
    });

    return e;
  }

});
