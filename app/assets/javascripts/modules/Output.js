(function (Module) {

zound.modules.Output = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Output",
    color: "#222"
  }),
  initialize: function () {
    Module.prototype.initialize.call(this);
  },
  canHaveOutputs: function () {
    return false;
  }
}, { moduleName: "Output" });

}(zound.models.Module));

