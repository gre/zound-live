(function (Module) {

zound.modules.Output = Module.extend({
  defaults: _.extend({
    title: "Output"
  }, Module.prototype.defaults),
  initialize: function () {
    Module.prototype.initialize.call(this);
  },
  canHaveOutputs: function () {
    return false;
  }
}, { moduleName: "Output" });

}(zound.models.Module));

