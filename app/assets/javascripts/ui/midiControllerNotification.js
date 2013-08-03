
zound.ui.MIDIControllerNotification = Backbone.View.extend({
  
  className: "notification",

  initialize: function () {
    var assignModeBodyClass = "assign-mode";

    this.listenTo(this.model, "change:state", this.onSetChange);

    this.$assign = $('<a href="#" class="assign"><i class="icon-edit-sign visible-if-assign-mode"></i><i class="icon-edit visible-if-not-assign-mode"></i></a>');
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

    $body.on("mousedown", "[data-assignable]", _.bind(function (e) {
      if (!this.model.get("assignMode")) return;
      e.preventDefault(); // Prevent default component behavior (like input range sliding)
    }, this));
    $body.on("click", "[data-assignable]", _.bind(function (e) {
      if (!this.model.get("assignMode")) return;
      this.model.addAssignableNode($(e.currentTarget));
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
