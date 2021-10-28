export const en = {};
export const de = {};

de.headings = {
    files: "Dateien",
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
    files: "files",
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
<p><span class="commands">&2</span> | set random value for an instrument. notes will be reordered after 2 cycles. Set & 0 for no randomization. </p>
<p><span class="commands">/</span> | clear one, multiple or all instruments and snapshots. To clear one write the name behind the command</p>
<p><span class="commands">+</span> | copy instrument pattern to one or more instruments and start them</p>
<p><span class="commands">=</span> | save current instruments as snapshots. </p>
<p><span class="commands">bpm</span> | set BPM for the sequencer, e.g. bpm 170. Add a number for transition in seconds, e.g. bpm 170 4</p>
<p><span class="commands">record start</span> | start recording the sound (instead of hitting record button)</p>
<p><span class="commands">record stop</span> | stop recording the sound (instead of hitting record button)</p>

<h3>playing sounds</h3>

<p><span class="commands">bass</span> | the simplest way to start an instrument is to just type its name in the console and hit enter. 8 steps will be filled with a note #.</p>
<p><span class="commands">bass #-#</span> | the instrument name followed by signs for notes and pause will define a pattern. If less than 8 signs are entered, they will be duplicated until 8 steps are filled.</p>
<p><span class="commands">bass #-#3-#-12</span> | note signs followed by positive or negative number will change pitch</p>
<p><span class="commands">. bass</span> | a dot before the instrument name will mute it</p>
<p><span class="commands">> bass</span> | a greater sign before the instrument name will unmute it</p>
<p><span class="commands">bass 0.3</span> | setting the volume of an instrument with a range between 0.0 and 1.0</p>
<p><span class="commands">bass &3</span> | setting random parameter, e.g. after ho many cycles notes will be reordered randomly</p>
<p><span class="commands">bass 0.6 ###2## &2</span> | setting multiple parameters at once</p>
<p><span class="commands">bass hh kick ###2##</span> | all commands can be set for multiple instruments</p>
<p><span class="commands">bass + string hh</span> | copy pattern from one instrument to one or more other instruments</p>
<p><span class="commands">/ bass</span> | delete instrument or snapshot</p>
<p><span class="commands">/ bass hh</span> | delete multiple instruments or snapshots</p>
<p><span class="commands">/ </span> | delete all instruments and snapshots</p>
<p><span class="commands">= pizza</span> | save a snapshot of current instruments. will generate a button after the console. clicking the button recalls the stored values. multiple different snapshots can be stored. Names can be whatever, only existing instrument names are forbidden.</p>
<p><span class="commands">bpm 150 </span> | change bpm to 150</p>
<p><span class="commands">bpm 70 4</span> | change bpm to 70 in 4 seconds</p>

<h3>using midi</h3>

<p>
WELLE can work as text-based MIDI sequencer. It will send MIDI start/stop/clock commands. To enable MIDI go to settings and select a MIDI device.
The first 14 instruments are assigned to MIDI channels 1-14 and will transmit note on, note off and velocity values. 
There will be a big and varying latency caused by the Webaudio timing, so using both internal sounds and sounds trigger via MIDI is not synchronous: 
mute the website's sound in the settings and only use MIDI sounds.
</p>

`;
de.tutorial = `
<h3>Überblick</h3>
Welle ist ein <b>textbasierter 8-Schritt-Sequenzer</b> mit vordefinierten Sample-Klängen. 
WELLE wird durch die Eingabe von Befehlen in das Eingabefeld namens "Konsole" gespielt. 
Alle verfügbaren Sounds sind unter "Instrumente" aufgelistet - klicke sie an, um zu hören, wie sie klingen. 
Mit den verschiedenen Konsolenbefehlen können Patterns und Melodien abgespielt werden. 
So genannte "Momente" der aktuell gespielten Instrumente können gespeichert und später wieder abgerufen werden. 
Außerdem kann die Musik aufgenommen und heruntergeladen werden. 
Die Instrumente können auch als MIDI-Befehle an Synthesizer, Sampler oder DAW gesendet werden (die MIDI-Kanäle 1-14 entsprechen der Reihenfolge der Samples).

<p>
In WELLE ist ein Pattern eine Kombination aus einer Note "#" und einer Pause "-". 
Hinter einer Note kann eine Zahl stehen, z.B. "#3" oder "#-12", so dass das Sample in einer höheren oder niedrigeren Tonhöhe abgespielt wird. 
Die Tonhöhe wird in Halbtonschritten angehoben bzw. abgesenkt. 
Wenn ein Pattern eingeben wird, das kürzer als 8 Noten ist, wird es wiederholt, 
bis 8 Schritte ausgefüllt sind. 
Wenn das Pattern länger als 8 Noten ist, wird es auf 8 Schritte reduziert.
</p>

Im Eingabefeld kann auf die Eingabehistorie zugegriffen werden: Pfeiltasten verwenden (aufwärts und abwärts), 
um vorherige Eingaben abzurufen und erneut zu verwenden.

<p>Viel Spaß!</p>

<h3>Konsolenbefehle</h3>

<p><span class="commands">></span> | startet den Sequenzer oder schaltet ein oder mehrere Instrumente an</p>
<p><span class="commands">.</span> | stoppt den Sequenzer oder schaltet ein oder mehrere Instrumente stumm</p>
<p><span class="commands">#</span> | Zeichen für eine Note</p>
<p><span class="commands">-</span> | Zeichen für eine Pause</p>
<p><span class="commands">#3</span> | Tonhöhe für eine Note, kann positib oder negativ sein, z.B. #2, #-12</p>
<p><span class="commands">0.4</span> | Lautstärke für ein Instrument, zwischen 0.0 und 1.0</p>
<p><span class="commands">&2</span> | Setzt den Zufallswert für ein Instrument. Die Noten werden nach 2 Zyklen neu sortiert. Zurücksetzen mit &0 .</p>
<p><span class="commands">/</span> | ein, mehrere oder alle Instrumente und Momente löschen. Um ein Instrument zu löschen z.B.: / bass</p>
<p><span class="commands">+</span> | Pattern auf ein oder mehrere Instrumente kopieren und diese starten</p>
<p><span class="commands">=</span> | speichert aktivierte Instrumente als "Momente". </p>
<p><span class="commands">bpm</span> | BPM für den Sequenzer festlegen, z. B. bpm 170. Fügen Sie eine Zahl für den Übergang in Sekunden hinzu, z. B. bpm 170 4</p>
<p><span class="commands">record start</span> | Starten Sie die Aufnahme des Tons (anstatt die Aufnahmetaste zu drücken)</p>
<p><span class="commands">record stop</span> | die Aufnahme stoppen (anstatt die Aufnahmetaste zu drücken)</p>

<h3>Instrumente spielen</h3>

<p><span class="commands">bass</span> | Der einfachste Weg, ein Instrument zu starten, ist, seinen Namen in die Konsole einzugeben und die Eingabetaste zu drücken. 8 Schritte werden mit der Note # gefüllt.</p>
<p><span class="commands">bass #-#</span> | der Instrumentenname, gefolgt von Zeichen für Noten und Pause, definiert ein Pattern. Wenn weniger als 8 Zeichen eingegeben werden, werden sie dupliziert, bis 8 Schritte gefüllt sind.</p>
<p><span class="commands">bass #-#3-#-12</span> | Notenzeichen, gefolgt von einer positiven oder negativen Zahl, ändern die Tonhöhe</p>
<p><span class="commands">. bass</span> | ein Punkt vor dem Namen des Instruments schaltet es stumm</p>
<p><span class="commands">> bass</span> | ein Größerzeichen vor dem Namen des Instruments hebt dessen Stummschaltung auf</p>
<p><span class="commands">bass 0.3</span> | Einstellung der Lautstärke eines Instruments im Bereich zwischen 0.0 und 1.0</p>
<p><span class="commands">bass &3</span> | Einstellung des Zufallsparameters, z.B. nach wie vielen Zyklen werden die Noten zufällig neu geordnet</p>
<p><span class="commands">bass 0.6 ###2## &2</span> | Einstellen mehrerer Parameter auf einmal</p>
<p><span class="commands">bass hh kick ###2##</span> | alle Befehle können auf mehrere Instrumente angewendet werden</p>
<p><span class="commands">bass + string hh</span> | Kopieren eines Patterns von einem Instrument auf ein oder mehrere andere Instrumente</p>
<p><span class="commands">/ bass</span> | Löschen von aktiven Instrument oder Moment</p>
<p><span class="commands">/ bass hh</span> | Löschen von mehreren aktiven Instrumenten und Momenten</p>
<p><span class="commands">/ </span> | Löschen von allen aktiven Instrumenten und Momenten</p>
<p><span class="commands">= pizza</span> | Speichert die aktiven Instrumente als "Moment" und erzeugt eine Schaltfläche hinter der Konsole. Durch Anklicken der Schaltfläche werden die gespeicherten Werte wieder aufgerufen. Es können mehrere verschiedene Momente gespeichert werden. Die Namen können beliebig sein, nur bestehende Instrumentennamen sind verboten.</p>
<p><span class="commands">bpm 150 </span> | Wechseln von BPM zu 150</p>
<p><span class="commands">bpm 70 4</span> | Wechseln von BPM zu 70 in 4 Sekunden.</p>

<h3>MIDI benutzen</h3>

<p>
WELLE kann als textbasierter MIDI-Sequenzer arbeiten. WELLE sendet MIDI Start/Stop/Taktbefehle. Um MIDI zu aktivieren, gehen Sie zu den Einstellungen und wählen Sie ein MIDI-Gerät aus.
Die ersten 14 Instrumente sind jetzt den MIDI-Kanälen 1-14 zugeordnet und senden Note On, Note Off und Velocity-Werte. 
WELLE hat beim Gebrauch von MIDI eine Latenz, die durch das Webaudio-Timing verursacht wird, so dass die Verwendung von internen Sounds und Sounds, die über MIDI angespielt werden, nicht synchron ist: 
Schalten Sie den Sound der Website in den Einstellungen stumm und verwenden Sie nur MIDI-Sounds.
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
WELLE ist ein barrierefreies webbasiertes Musikprogramm. Die Website wurde entwickelt als Teil 
des Forschungsprojekts Tangible Signals von Jens Vetter, 
unter der Leitung von Martin Kaltenbrunner 
am Tangible Music Lab, Kunstuniversität Linz, Österreich.
Das Forschungsprojekt wird gefördert durch das 
DOC-Stipendium der Österreichischen Akademie der Wissenschaften, Juni 2019.
</p>
<p>Projektwebsite "Tangible Signals": <a href="https://tamlab.ufg.at/projects/tangible-signals/" title="go to Tangible Music Lab's project website">tamlab.ufg.at/projects/tangible-signals</a></p>

<p>
Quellcode auf Github: <a href="https://github.com/JnsVttr/Welle" title="go to Github WELLE code">github.com/welle</a>.
Diese Website nutzt das Webaudio framework <a href="https://tonejs.github.io/" title="Tone.js">Tone.js</a> und 
<a href="https://ohmlang.github.io/" title="Ohm">Ohm.js</a>.
</p>
<p>© Jens Vetter</p>
`;
