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

<br>
<br>
<br>
<br>
<br>
<br>
<h2 id="help">help</h2>


<h3>saving and loading compositions</h3>

<p>
In WELLE it is possible to save the current composition as a file on your computer (option not enabled for smartphones, iPads). 
The file will be a .json file.  Pay attention to your browser download settings - you may have to allow the download of the file, and you might want to enable a 
donwload dialog window in the settings to select the download directory and the filename. 
</p>
<p>
The composition file contains all instruments patterns, volume, etc. and also the snapshots you made. It also contains the names of 
the active instruments you used, but not the instruments themselves. 
If you used your own instruments via the 'upload instruments' button, it will store their names labeled as 'user' instruments. 
</p>
<p>
Once you saved a composition, you can upload it back into WELLE. It will automatically select the right instruments selection and 
activate instruments and recreate snapshots, so you are immediatly ready to play. A small status text after the 'load composition' button
will contain some feedback about wether the upload was successfull. If you only see your snapshots, but no active instruments, then either 
you used your own uploaded instruments and haven't uploaded them yet, or the instruments stored in the composition are not availible anymore on the server.
You shouldn't change your local composition json file, because this could cause errors in WELLE. 
</p>

<h3>download and upload of instruments</h3>

<p>
In WELLE you can use the provided instruments to compose music. There are default instruments, and also instrument packs to select. 
If you want to download the all the instruments currently displayed, just hit the 'download instruments' button. You will get a .zip folder with these instruments.
The instruments are just short .mp3 files. On your computer you can copy your favourite instruments in a folder and upload them again.
The download option is not active for your own uploaded instruments. 
</p>
<p>
To upload instruments, hit the 'upload instruments' button and select multiple files. Only .mp3 files smaller than 130KB are allowed (ca.3 seconds at 320Kb/s). You can upload up to 30 files.
Their names will be converted to lowercase and the instruments will be displayed in WELLE. Now you can start to play with them.
A small status text after the button will inform you about the upload success. 
</p>

<h3>contact and feedback</h3>
<p>
If you have issues or suggestions, please feel free to get in touch! A contact email address is shown at the bottom of the page. 
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


<br>
<br>
<br>
<br>
<br>
<br>
<h2 id="help">Hilfe</h2>


<h3>Speichern und Laden von Kompositionen</h3>
<p></p>
<p>
In WELLE ist es möglich, die aktuelle Komposition als Datei auf Ihrem Computer zu speichern (diese Option ist für Smartphones und iPads nicht verfügbar). 
Bei der Datei handelt es sich um eine .json-Datei. Achten Sie auf die Download-Einstellungen Ihres Browsers - möglicherweise müssen Sie den Download der Datei 
zulassen und in den Einstellungen ein Dialogfenster zum Herunterladen aktivieren, um das Download-Verzeichnis und den Dateinamen auszuwählen.
</p>

<p>
Die Kompositionsdatei enthält alle Instrumenten Pattern, Lautstärke usw. sowie die von Ihnen erstellten Momente. 
Sie enthält auch die Namen der aktiven Instrumente, die Sie verwendet haben, allerdings nicht die Instrumente selbst. 
Wenn Sie Ihre eigenen Instrumente über die Schaltfläche "Instrumente laden" verwendet haben, werden deren Namen mit dem Zusatz "Benutzer"-Instrumente gespeichert.
</p>
<p>
Sobald Sie eine Komposition gespeichert haben, können Sie sie wieder in WELLE hochladen. 
Es werden automatisch die entsprechenden Instrumente ausgewählt, die Instrumente aktiviert und die Momente neu erstellt, so dass Sie sofort spielbereit sind. 
Ein kleiner Statustext nach der Schaltfläche 'Komposition laden' gibt Ihnen eine Rückmeldung, ob der Upload erfolgreich war. 
Wenn Sie nur Ihre Momente sehen, aber keine aktiven Instrumente, dann haben Sie entweder Ihre eigenen hochgeladenen Instrumente verwendet 
und diese noch nicht wieder hochgeladen, oder die in der Komposition gespeicherten Instrumente sind auf dem Server nicht mehr verfügbar. 
Sie sollten Ihre lokale Kompositions-Datei nicht ändern, da dies zu Fehlern in WELLE führen kann.
</p>

<h3>Speichern und Laden von Instrumenten</h3>

<p>
In WELLE können Sie die mitgelieferten Instrumente zum Komponieren von Musik verwenden. 
Es gibt voreingestellte Instrumente und auch Instrumentenpakete, die Sie auswählen können. 
Wenn Sie alle derzeit angezeigten Instrumente herunterladen möchten, klicken Sie einfach auf die Schaltfläche "Instrumente speichern". 
Sie erhalten dann einen .zip-Ordner mit diesen Instrumenten. 
Bei den Instrumenten handelt es sich um kurze .mp3-Dateien. Auf Ihrem Computer können Sie Ihre Lieblingsinstrumente z.B. in einen Ordner kopieren und wieder hochladen. 
Die Download-Option ist nicht aktiv für Ihre eigenen hochgeladenen Instrumente.
</p>
<p>
Um Instrumente hochzuladen, klicken Sie auf die Schaltfläche "Instrumente laden" und wählen Sie mehrere Dateien aus. 
Es sind nur .mp3-Dateien erlaubt, die kleiner als 130KB sind (ca. 3 Sekunden bei 320Kb/s). Sie können bis zu 30 Dateien hochladen. 
Die Namen werden in Kleinbuchstaben umgewandelt und die Instrumente werden in WELLE angezeigt. 
Jetzt können Sie mit ihnen spielen. Ein kleiner Statustext hinter der Schaltfläche informiert Sie über den erfolgreichen Upload.
</p>

<h3>Kontakt und Rückmeldung</h3>
<p>
Wenn Sie Probleme oder Vorschläge haben, melden Sie sich bitte! Eine Kontakt-E-Mail-Adresse finden Sie unten auf der Seite. 
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
<p>contact: jens.vetter|a|ufg.at
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
<p>Kontakt: jens.vetter|a|ufg.at
<p>© Jens Vetter</p>
`;
