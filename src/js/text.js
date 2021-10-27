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
};
en.headings = {
    settings: "settings",
    transport: "transport",
    instruments: "instruments",
    console: "console",
    packs: "sample packs",
    tutorial: "tutorial",
    overview: "overview",
};

en.tutorial = `
<h3>overview</h3>
<p>
Get to know WELLE. It is basically a <b>text-based 8-step sequencer</b> with predefined sample sounds.
The samples are displayed at the top of the page, click on them to hear what they sound like. 
You can input commands in the input field (console) to make music. 
You can save and recall snapshots of your music on-the-fly.
Also you can record your music. Or send it as MIDI messages to your preferred DAW 
(the MIDI channels 1-14 correspond to the order of the samples).
</p>
<p>
In WELLE a pattern is a combination from a note "#" and a pause "-". 
A note can have a number behind it, e.g. "#3" or "#-12", 
so it is higher or lower than the default "#". The numbers correspond to keys on a keyboard.
If you enter a pattern shorter than 8 notes, it will be repeated to fill 8 steps.
If your pattern is longer than 8 notes, it will be reduced to 8 steps.
</p>
<p>
While in the input field you can use the arrow keys (up & down)  to recall and modify  previous input.
</p>
<p>
HAVE FUN !
</p>
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
link to project website: <a href="https://tamlab.ufg.at" title="go to Tangible Music Lab's website tamlab.ufg.at">tamlab.ufg.at</a>
</p>

<p>
link to Jens Vetter's website: <a href="https://jensvetter.de" title="go to Jens Vetter's website jensvetter.de">jensvetter.de</a>
</p>

<p>
The source code is published on <a href="https://github.com/JnsVttr/Welle" title="go to Github WELLE code">github.com/welle</a>.
</p>
`;

de.info = `
<p>
WELLE ist ein Webbrowser-basiertes Musikprogramm. 
</p>
`;
