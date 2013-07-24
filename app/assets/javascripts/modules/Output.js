(function (Module) {

zound.modules.Output = Module.extend({
  defaults: _.extend({}, Module.prototype.defaults, {
    title: "Output",
    color: "#222"
  }),
  canHaveOutputs: function () {
    return false;
  },
  playThrough: function (nodeInput, ctx) {
    nodeInput.connect(ctx.destination);
  }
}, { moduleName: "Output" });

}(zound.models.Module));

