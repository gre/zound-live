
zound.ui.MIDIControllerNotification = Backbone.View.extend({
  
  className: "notification",

  initialize: function () {
    var assignModeBodyClass = "assign-mode";

    this.listenTo(this.model, "change:state", this.onSetChange);

    this.$assign = $('<a href="#" class="assign"><i class="icon-edit-sign icon-2x"></i></a>');
    this.$icon = $('<span class="notification-icon">MIDI <i class="icon-circle"></i></span>');
    this.$el.append(this.$assign);
    this.$el.append(this.$icon);

    var $body = $(document.body);
    this.$assign.click(_.bind(function (e) {
      e.preventDefault();
      if ($body.hasClass(assignModeBodyClass)) {
        $body.removeClass(assignModeBodyClass);
        this.model.set("assignMode", false);
      }
      else {
        $body.addClass(assignModeBodyClass);
        this.model.set("assignMode", true);
      }
    }, this));

    $(document).on("newAssignable", _.bind(function (e, node) {
      this.model.setAssignableValueForNode(node);
    }, this));

    $body.on("mousedown", "[data-assignable]", _.bind(function (e) {
      if (!this.model.get("assignMode")) return;
      e.preventDefault(); // Prevent default component behavior (like input range sliding)
    }, this));
    $body.on("click", "[data-assignable]", _.bind(function (e) {
      if (!this.model.get("assignMode")) return;
      var node = e.currentTarget;
      if (this.model.nodeIsInAssignables(node)) {
        this.model.removeAssignableNode(node);
      }
      else {
        this.model.addAssignableNode(node);
      }
    }, this));

    this.render();
  },
  onSetChange: function (model, message) {
    this.$el.attr("data-state", message);
  },
  render: function () {
    this.onSetChange(this.model, this.model.get("state"));
  }
});
