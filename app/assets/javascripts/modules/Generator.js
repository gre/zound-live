(function (Module) {

zound.modules.Generator = Module.extend({
  initialize: function () {
    Module.prototype.initialize.call(this);
    this.pVolume = new zound.models.ModulePropertyRange({ min: 0, max: 100, title: "Volume" });
    this.pType = new zound.models.ModulePropertySelect({ values: ["sin", "triangle", "square", "saw"], title: "Type" });
    this.properties.add([this.pVolume, this.pType]);
  },
  canHaveInputs: function () {
    return false;
  }
}, { moduleName: "Generator" });

}(zound.models.Module));
