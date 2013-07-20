(function (Module) {

zound.modules.Generator = Module.extend({
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 1 });
    this.properties.add(this.pVolume);
  },
  canHaveInputs: function () {
    return false;
  }
}, { moduleName: "Generator" });

}(zound.models.Module));
