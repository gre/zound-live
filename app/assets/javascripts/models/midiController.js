
zound.models.MIDIController = Backbone.Model.extend({
  initialize: function () {
    if ( !("requestMIDIAccess" in navigator) ) {
      console.log("requestMIDIAccess is not supported by your browser.");
      this.set("state", "error", new Error("MIDI not supported by your browser"));
      return;
    }

    this.set("state", "loading");
    this.midiAccessPromise = navigator.requestMIDIAccess();
    this.midiAccessPromise.then(_.bind(this.onMidiSuccess, this), _.bind(this.onMidiError, this));
    this.assigned = [];
    this.assignables = []; // Array of DOM element (not jQuery)
    this.lastAssigned = []; // copy of assignables elements when assignables is affected
    this.on("change:assignMode", _.bind(function () {
      this.lastAssigned = [];
      _.each(this.assignables, function (node) {
        zound.models.MIDIController.setAssignableValueForEmpty(node);
      });
      this.assignables = [];
    }, this));
  },

  bindInput: function (input) {
    input.onmidimessage = _.bind(this.onMidiMessage, this);
  },

  noteOn: function (noteNumber, noteVelocity) {
    this.trigger("noteOn", noteNumber, noteVelocity);
  },

  noteOff: function (noteNumber, noteVelocity) {
    this.trigger("noteOff", noteNumber, noteVelocity);
  },

  control: function (controlId, value) {
    var assign = _.find(this.assigned, function (assign) {
      return assign.controlId === controlId;
    });
    if (assign) {
      assign.f(value);
    }

    if (this.assignables.length > 0) {
      var node = this.assignables.shift();
      if (_.any(this.lastAssigned, function (assign) {
        return assign.controlId === controlId;
      })) {
        this.assignables.unshift(node);
        return; // already in my last assignables
      }
      
      this.removeAssigned(function (assign) {
        return assign.nodeId === node.id || assign.controlId === controlId;
      });
      var f = $(node).data("assignable");
      var assign = {
        nodeId: node.id,
        controlId: controlId,
        f: f
      };
      this.assigned.push(assign);
      this.lastAssigned.push(assign);
      zound.models.MIDIController.setAssignableValueForControlNumber(node, controlId);
      if (this.assignables.length == 0) {
        this.lastAssigned = [];
      }
    }
  },

  onMidiMessage: function (message) {
    // @see http://www.midi.org/techspecs/midimessages.php 
    var status = message.data[0];
    var byte2 = message.data[1];
    var byte3 = message.data[2];
    // We only handle Channel 1 here...
    switch (status) {
      case 128: // NOTE OFF
        this.noteOff(byte2, byte3);
        break;
      case 144: // NOTE ON
        this.noteOn(byte2, byte3);
        break;
      case 176: // control change
        this.control(byte2, byte3);
        break;
      case 192: // program change
        this.control("prog", byte2); // consider it as control
        break;
      case 224:
        this.control("PB", byte3+byte2/127);
        break;
      default:
        console.log( "Unknown status code : " + status);
    }
  },

  onMidiSuccess: function (midiAccess) {
    // OUCH this is not working! It seems we have to reboot the browser each time!
    midiAccess.onconnect = function () {
      console.log("onconnect", arguments);
    }
    midiAccess.ondisconnect = function () {
      console.log("ondisconnect", arguments);
    }

    var inputs = midiAccess.inputs();
    console.log("MIDI inputs: ", inputs);

    /*
    for (i=0; i<inputs.length; i++) {
      console.log( "Input port #" + i + 
          ": type:'" + inputs[i].type +
          "' id:'" + inputs[i].id +
          "' manufacturer:'" + inputs[i].manufacturer +
          "' name:'" + inputs[i].name +
          "' version:'" + inputs[i].version + "'" );
    }
    */

    if (inputs.length) {
      _.each(inputs, this.bindInput, this);
      this.set("state", "success");
    }
    else {
      this.set("state", "noinputs");
    }
  },
  onMidiError: function (error) {
    console.log("MIDI Access failed:", error);
    this.set("state", "error", error);
  },

  // Assignables functions

  nodeIsInAssignables: function (node) {
    return _.any(this.assignables, function (n) { return n.id === node.id });
  },

  removeAssignableNode: function (node) {
    this.removeAssignedByNode(node);
    this.assignables = _.without(this.assignables, node);
    zound.models.MIDIController.setAssignableValueForEmpty(node);
  },

  addAssignableNode: function (node) {
    this.removeAssignedByNode(node);
    zound.models.MIDIController.setAssignableValueForWaiting(node);
    this.assignables.push(node);
  },

  setAssignableValueForNode: function (node) {
    if (this.nodeIsInAssignables(node))
      return zound.models.MIDIController.setAssignableValueForWaiting(node);
    var assign = _.find(this.assigned, function (assign) {
      return assign.nodeId === node.id;
    });
    if (assign) {
      return zound.models.MIDIController.setAssignableValueForControlNumber(node, assign.controlId);
    }
    return zound.models.MIDIController.setAssignableValueForEmpty(node);
  },

  // Assigned functions

  removeAssignedByNode: function (node) {
    return this.removeAssigned(function (assign) {
      return assign.nodeId === node.id;
    });
  },

  removeAssigned: function (rejectFunction) {
    var split = _.groupBy(this.assigned, function (assign) {
      return rejectFunction(assign) ? "reject" : "keep";
    });
    _.each(split.reject, function (assign) {
      zound.models.MIDIController.setAssignableValueForEmpty(document.getElementById(assign.nodeId));
    });
    this.assigned = split.keep||[];
  }


}, {
  setAssignableValueForControlNumber: function (node, cn) {
    $(node).attr("data-assignable", ""+cn);
  },
  setAssignableValueForWaiting: function (node) {
    $(node).attr("data-assignable", "?");
  },
  setAssignableValueForEmpty: function (node) {
    $(node).attr("data-assignable", "");
  },
  makeAssignable: function (node, func) {
    node = $(node)[0];
    if (!node.id) {
      console.log(node);
      throw new Error("node must have an id attribute!");
    }
    $(node).attr("data-assignable", "").data("assignable", func);
    $(document).trigger("newAssignable", node);
  }
});
