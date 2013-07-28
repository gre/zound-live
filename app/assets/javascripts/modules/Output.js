(function (Module) {

zound.modules.Output = Module.extend({
  canHaveOutputs: function () {
    return false;
  },
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(ctx.destination);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(ctx.destination);
  }
});

}(zound.models.Module));

