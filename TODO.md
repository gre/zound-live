Required
---

* Network synchronisation: broadcast events to everyone, synchronize models, ensure views are sync, ensure no inconsistent state between different clients
* Implementing audio modules (see the Google Doc for more infos)
* add modules to the node editor
* remove modules from the node editor
* Improve the "assign-mode" feature
  * All kind of buttons of the interface should be supported
  * Un-assign a key if assign somewhere else, un-assign by clicking two time on a button
* Record notes mode : the loop player is running and notes are putted where the cursor is (quite simple to do)
* Improve design

Nice to have
---

* "preview" notes (always trigger notes when pressing the MIDI/keyboard notes)
* implement the volume control (could be done by adding a Gain to the Output module)
* Octave +/- buttons
* improve MIDI support (my MIDI keyboard has an unsupported knob) + log all unsupported MIDI key code in the console
* Some global module actions in the module properties feature
  * mute a module
  * solo mode (see SunVox "S" letter)
* Init from scratch to we can easily make the page reload working
* Move & Zoom in node editor
* Display device names under MIDI
* More flexible UI
* Read-only page (+ eventually auth for musicians)
