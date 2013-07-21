
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
    this.assignables = [];
    this.on("change:assignMode", _.bind(function () {
      this.assignables = [];
    }, this));
  },

  bindInput: function (input) {
    input.onmidimessage = _.bind(this.onMidiMessage, this);
  },

  // FIXME: WIP still a lot of things to clean in the assignment system
  addAssignable: function (assignable, onAssigned) {
    console.log("assign", this, assignable);
    this.assignables.push([ assignable, onAssigned ]);
  },

  noteOn: function (noteNumber, noteVelocity) {
    this.trigger("noteOn", noteNumber, noteVelocity);
  },

  noteOff: function (noteNumber, noteVelocity) {
    this.trigger("noteOff", noteNumber, noteVelocity);
  },

  control: function (controlNumber, value) {
    if (this.assignables.length) {
      var assign = this.assignables.pop();
      this.off("control:"+controlNumber);
      this.on("control:"+controlNumber, assign[0].handleMessage);
      assign[1]("cn="+controlNumber);
    }
    this.trigger("control:"+controlNumber, value);
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
      case 176: // control
        this.control(byte2, byte3);

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
