
zound.models.MIDIController = Backbone.Model.extend({
  initialize: function () {
    if ( !("requestMIDIAccess" in navigator) ) {
      console.log("requestMIDIAccess is not supported by your browser.");
      this.set("state", "error", new Error("MIDI not supported by your browser"));
      return;
    }

    this.assignedControls = {};

    this.set("state", "loading");
    this.midiAccessPromise = navigator.requestMIDIAccess();
    this.midiAccessPromise.then(_.bind(this.onMidiSuccess, this), _.bind(this.onMidiError, this));
    this.assignable = null;
    this.on("change:assignMode", _.bind(function () {
      this.assignable = null;
    }, this));
  },

  bindInput: function (input) {
    input.onmidimessage = _.bind(this.onMidiMessage, this);
  },

  addAssignable: function (assignable, onAssigned) {
    if(this.assignable) return false;
    console.log("assign", this, assignable);
    this.assignable = [ assignable, onAssigned ];
    return true;
  },

  noteOn: function (noteNumber, noteVelocity) {
    this.trigger("noteOn", noteNumber, noteVelocity);
  },

  noteOff: function (noteNumber, noteVelocity) {
    this.trigger("noteOff", noteNumber, noteVelocity);
  },

  control: function (controlNumber, value) {
    if (this.assignable) {
      var assign = this.assignable;
      this.assignable = null;

      var control = this.assignedControls[controlNumber];

      

      this.off( "control:" + controlNumber);
      this.on(  "control:" + controlNumber, assign[0].handleMessage);
      assign[1]("cn=" + controlNumber);

    }
    this.trigger("control:" + controlNumber, value);
  },

  removeControl: function(){},
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
      case 176: // control
        this.control(byte2, byte3);
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
  }
});
