(function (Module) {

zound.modules.Output = Module.extend({
  canPlugTo: function (out) {
    return false;
  },
  canHaveOutputs: function () {
    return false;
  },
  canPlayNote: function () {
    return false;
  },
  init: function (ctx) {
    this.input = ctx.destination;
  },
  plugInput: function (nodeInput, ctx) {
    nodeInput.connect(this.input);
    this.broadcastToOutputs(this.output, ctx);
  },
  unplugInput: function (nodeInput, ctx) {
    nodeInput.disconnect(this.input);
  }
});

}(zound.models.Module));

