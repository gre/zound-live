
zound.models.ModuleProperties = Backbone.Collection.extend({
  model: zound.models.ModuleProperty
});

zound.models.ModuleProperty = Backbone.Model.extend({
  initialize: function () {

  }
});

zound.models.ModulePropertyRange = zound.models.ModuleProperty.extend({
  defaults: {
    min: 0,
    max: 1,
    value: 0,
    round: true,
    title: "no title"
  },
  initialize: function () {
    
  },
  setPercent: function (percent) {
    var min = this.get("min");
    var max = this.get("max");
    var round = this.get("round");
    var value = min+percent*(max-min);
    this.set("value", round ? Math.round(value) : value);
  },
  getPercent: function () {
    var value = this.get("value");
    var min = this.get("min");
    var max = this.get("max");
    return (value-min)/(max-min);
  },
  getText: function () {
    return this.get("value");
  }
});

zound.models.ModulePropertySelect = zound.models.ModuleProperty.extend({
  defaults: {
    values: ["on", "off"],
    value: 0,
    title: "no title"
  },
  initialize: function () {
    
  },
  setPercent: function (percent) {
    var values = this.get("values");
    var value = Math.round(percent*values.length);
    this.set("value", value);
  },
  getPercent: function () {
    var values = this.get("values");
    var value = this.get("value");
    return value / values.length;
  },
  getText: function () {
    var values = this.get("values");
    return values[this.get("value")];
  }
});
