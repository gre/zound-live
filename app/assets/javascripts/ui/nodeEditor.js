zound.ui.NodeEditor = Backbone.View.extend({
  options: {
    w: 700,
    h: 380,
    // nodes options
    outerCircleWidth: 8,
    margin: 12,
    r: 30
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
  },

  listenModule: function (module) {
    this.listenTo(module, "change", this.render);
    this.listenTo(module, "waveData", this.render);
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

  draw: function (data) {
    // TODO FIXME: performance need to be improved here, 
    // we need to not re-render everything everytime
    // + we have to use more "transform" attr.

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
      .attr('id', get('id'))
      .attr("cursor", "pointer");

    // outer circle
    g.append('svg:circle')
      .attr('class', 'outer')
      .attr("fill", "#f3f9ff")
      .attr("stroke-width", options.outerCircleWidth)
      .attr("r",  options.r + options.margin);

    e.select('.outer')
      .attr("cx", get('x'))
      .attr("cy", get('y'))
      .attr("stroke", function(m) { return CURRENT_USER.get("module")==m.id ? '#79838e' : '#bfcbdb'; });

    // center circle
    g.append('svg:circle')
      .attr('class', 'inner')
      .attr("fill", "#456")
      .attr("stroke-width", 0)
      .attr("r", options.r);
    e.select('.inner')
      .attr("cx", get('x'))
      .attr("cy", get('y'));

    // Waveform in real time
    (function () {    
        var r = options.r;

        g.append("svg:path")
            .attr('class', 'waveform')
            .attr("fill", "transparent")
            .attr("stroke-width", 1)
            .attr("stroke", "rgba(255,255,255,0.4)");

        e.select('.waveform')
          .attr("d", function(m) {
              var x = d3.scale.linear()
                  .domain([0, m.samplesLength])
                  .range([-r, +r]);

              var y = d3.scale.linear()
                  .domain([-127, 128]) // Uint8
                  .range([+r, -r]);

              return d3.svg.line()
                .interpolate("linear")
                .x(function(d,i) { return m.get("x")+x(i); })
                .y(function(d) { return m.get("y")+y(d.y); })
                (_.map(m.waveData, function (byt, i) {
                  return { x: i, y: (byt-127) };
                }));
            });
    }());

    // title
    g.append("svg:text")
      .attr('class', 'title')
      .attr("fill", '#fff')
      .attr("font-family", "Open Sans")
      .attr("font-size", "10px")
      .attr("text-anchor", "middle");
    e.select('.title')
      .attr("x", get('x'))
      .attr("y", function(d){ return d.get('y') - 5; })
      .text(get('title'));

    // id
    g.append("svg:text")
      .attr('class', 'id')
      .attr("fill", "#FFD384")
      .attr("text-anchor", "middle")
      .attr("font-family", "monospace")
      .attr("font-weight", "bold")
      .attr("font-size", "8px");
    e.select('.id')
      .attr("x", get('x'))
      .attr("y", function(d){ return d.get('y') + 10; })
      .text(function(m){ return m.getDisplayId(); });

    // note animation
    g.each(function(m){
      var group = d3.select(this),
          inner = group.select('.inner');
      editor.listenTo(m, "noteOn", function(){
        inner
          .transition()
          .attr("r", options.r+options.margin)
          .duration(0);
      });
      editor.listenTo(m, "noteOff", function(){
        inner.transition()
          .attr("r", options.r)
          .duration(200);
      });
    });

    return e;
  }

});
