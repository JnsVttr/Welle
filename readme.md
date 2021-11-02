# Welle

Welle is a text-based 8-step sequencer with predefined sample sounds.
The samples are displayed at the top of the page, click on them to hear what they sound like.
You can input commands in the input field (console) to make music.
You can save and recall snapshots of your music on-the-fly.
Also you can record your music. Or send it as MIDI messages to your
preferred DAW (the MIDI channels 1-14 correspond to the order of the samples).

In WELLE a pattern is a combination from a note "#" and a pause "-".
A note can have a number behind it, e.g. "#3" or "#-12", so it is higher or
lower than the default "#". The numbers correspond to keys on a keyboard.
If you enter a pattern shorter than 8 notes, it will be repeated to fill 8 steps.
If your pattern is longer than 8 notes, it will be reduced to 8 steps.

While in the input field you can use the arrow keys (up & down) to recall and modify previous input.

Example Code:

```
kick
kick #-#-##
string #-#23-
= beat
vol 0.8 kick
bpm 110
bass + drums
string &2
```

![Screenshot](screenshot.png?v=4&s=200)

## Info

WELLE is a web-based music environment and was developed as part
of the [Tangible Signals research project](https://tamlab.ufg.at/projects/tangible-signals/) by Jens Vetter,
supervised by Martin Kaltenbrunner at the Tangible Music Lab,
University of Art and Design Linz, Austria.

## Live Demo

Please check the live version at:
[https://welle.live](https://welle.live).

## Built With

-   [Parcel](https://parceljs.org/) - The web application bundler
-   [Ohm](https://ohmlang.github.io) - A library and language for building parsers, interpreters, compilers, etc.
-   [Tone.js](https://tonejs.github.io/) - Tone.js is a framework for creating interactive music in the browser
