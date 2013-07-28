(function (Module) {

zound.modules.Output = Module.extend({
  canHaveOutputs: function () {
    return false;
  },
  init: function (ctx) {
    this.input = ctx.destination;
  }
});

}(zound.models.Module));

