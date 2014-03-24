ZOUND Live
===

Audio modular collaborative tracker using web technologies.

Getting started
---

1. Install SBT: http://www.scala-sbt.org/release/docs/Getting-Started/Setup.html
2. In the project, **execute `sbt`**
3. In the sbt console, **start the server with `run`**
4. Go to `http://localhost:9000/` with Chrome *(Canary is only required if you want to test the Web MIDI API without polyfill)*


Release note
---

### v0, Hackday stable version

see http://greweb.me/2013/07/zound-live/

- an unique tracker with a 32 lines loop and 23 tracks.
- different audio modules: Generator, Drum, MultiSynth, Filter, Delay, Reverb, Compressor
- MIDI note support + MIDI control assignation allowing to change module properties.
- Synchronisation of everything: the tracker and modules for all connected clients. But does not support save yet.
- off-mode allowing one user to prepare a track which is muted for other users.
- play/pause and record mode!
- cursor of users displayed on the tracker.

Keyboard
---

![](https://raw.github.com/gre/zound-live/master/docs/keyboard.svg.png)

Contributors
---

https://github.com/gre/zound-live/graphs/contributors

Copyright
---------

Copyright 2014 Zengularity

ZOUND live is free software: you can redistribute it and/or modify
it under the terms of the AFFERO GNU General Public License as published by
the Free Software Foundation.

ZOUND live is distributed "AS-IS" AND WITHOUT ANY WARRANTY OF ANY KIND,
INCLUDING ANY IMPLIED WARRANTY OF MERCHANTABILITY,
NON-INFRINGEMENT, OR FITNESS FOR A PARTICULAR PURPOSE. See
the AFFERO GNU General Public License for the complete license terms.

You should have received a copy of the AFFERO GNU General Public License
along with ZOUND live.  If not, see <http://www.gnu.org/licenses/agpl-3.0.html>
