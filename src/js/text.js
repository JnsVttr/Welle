export const en = {};
export const de = {};

de.headings = {
    settings: "Einstellungen",
    transport: "Transport",
    instruments: "Instrumente",
    console: "Konsole",
    packs: "Klang Kollektionen",
    tutorial: "Anleitung",
    overview: "Überblick",
    parts: "Momente",
    instList: "Aktive Instrumente",
};
en.headings = {
    settings: "settings",
    transport: "transport",
    instruments: "instruments",
    console: "console",
    packs: "sample packs",
    tutorial: "tutorial",
    overview: "overview",
    parts: "snaphots",
    instList: "active instruments",
};

en.tutorial = `
<h3>overview</h3>
<p>
Get to know WELLE. It is basically a <b>text-based 8-step sequencer</b> with predefined sample sounds.
WELLE is played by entering commands in the input field called "console".
All available sounds are listed under "instruments" - click on them to hear what they sound like. 
By using the different console commands you can play patterns and melodies. 
You can save so-called snapshots of your currently playing instruments on-the-fly and recall them later.
Also you can record and download your music. Or send the instruments as MIDI messages to 
your preferred synthesizer, sampler or DAW (the MIDI channels 1-14 correspond to the order of the samples).
</p>
<p>
In WELLE a pattern is a combination of a note "#" and a pause "-". 
A note can have a number behind it, e.g. "#3" or "#-12", 
so the sample is pitched higher or lower than the default "#". The pitch numbers correspond to keys on a keyboard.
If you enter a pattern shorter than 8 notes, it will be repeated to fill 8 steps.
If your pattern is longer than 8 notes, it will be reduced to 8 steps.
</p>
<p>
While in the input field you can access the input history: use the arrow keys (up & down) 
to recall and use previous input text again.
</p>
<p>
HAVE FUN !
</p>
<h3>console commands</h3>

<p><span class="commands">></span> | start the sequencer or unmute single/ multiple instruments</p>
<p><span class="commands">.</span> | stop the sequencer or mute single/ multiple instruments</p>
<p><span class="commands">#</span> | sign for a note</p>
<p><span class="commands">-</span> | sign for a pause</p>
<p><span class="commands">#3</span> | pitch for a note, can be positive or negative, e.g. #2, #-12</p>
<p><span class="commands">0.4</span> | volume for an instrument, range 0.0 to 1.0</p>
<p><span class="commands">& 2</span> | set random value for an instrument. notes will be reordered after 2 cycles. Set & 0 for no randomization. </p>
<p><span class="commands">/</span> | clear one, multiple or all instruments and snapshots. To clear one write the name behind the command</p>
<p><span class="commands">+</span> | copy instrument pattern to one or more instruments and start them</p>
<p><span class="commands">=</span> | save current instruments as snapshots. </p>
<p><span class="commands">bpm</span> | set BPM for the sequencer, e.g. bpm 170. Add a number for transition in seconds, e.g. bpm 170 4</p>
<p><span class="commands">record start</span> | start recording the sound (instead of hitting record button)</p>
<p><span class="commands">record stop</span> | stop recording the sound (instead of hitting record button)</p>


`;
de.tutorial = `
<h3>Überblick</h3>
<p>
Lerne WELLE kennen..!
</p>
`;

en.info = `
<p>
WELLE is a web-based music environment and was developed as 
part of the research project Tangible Signals by Jens Vetter, 
supervised by Martin Kaltenbrunner 
at the Tangible Music Lab, University of Art and Design  Linz, Austria.
The research project is funded with the 
DOC fellowship by the Austrian Academy of Sciences, starting June 2019.
</p>
<p>
Link to research project website: <a href="https://tamlab.ufg.at/projects/tangible-signals/" title="go to Tangible Music Lab's project website">tamlab.ufg.at/projects/tangible-signals/</a>.
The source code is published here: <a href="https://github.com/JnsVttr/Welle" title="go to Github WELLE code">github.com/welle</a>.
This website was build with the Webaudio framework <a href="https://tonejs.github.io/" title="Tone.js">Tone.js</a> and
<a href="https://ohmlang.github.io/" title="Ohm">Ohm.js</a>.
</p>
<p>© Jens Vetter</p>
`;

de.info = `
<p>
WELLE ist ein Webbrowser-basiertes Musikprogramm. 
</p>
`;
