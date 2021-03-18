let help = {}
help.menu = [
    'type:',
];
//` &nbsp;&nbsp;   | help pattern | help instruments |  | help session  | help examples `];
help.overview = [
    ['type:', 'help commands', 'help instruments', 'help files', 'help session', 'help examples'] 
];

help.commands = [
    ['Commands:', 'Description:'], 
    ['mute on/ off', 'mute sound output or alerts with buttons at the top of the page'],
    ['keyboard: arrow UP, arrow DOWN','navigate through input history'],
    ['&nbsp;', '&nbsp;'], 

    ['>', 'play it all'], 
    ['.', 'stop it all'], 
    ['bpm 112', 'set bpm 0 - 300  (bpm = beats per minute)'],
    ['bpm 220 2.2', 'set bpm to 220, in a ramp of 2.2 seconds '],
    ['&nbsp;', '&nbsp;'], 

    ['<b>Instruments</b>', ''],
    ['> bass ', 'init & play specific instrument, see "help instruments" for more info ..'], 
    ['> bass #-#-', 'init & play instrument with pattern'], 
    ['> bass drums metal', 'init & play multiple specific instruments'], 
    ['> bass drums metal #-##-#-', 'init & play multiple specific instruments with pattern'], 
    ['metal #-##12', 'play instrument new pattern (inst needs to be initialized first)'], 
    ['. bass ', 'stop specific instrument'], 
    ['. bass drums metal', 'stop multiple specific instruments'], 
    ['bass > metal','copy pattern to another instrument'],
    ['bass > metal drums string','copy pattern to multiple other  instruments'],
    ['&nbsp;', '&nbsp;'], 

    ['vol 0.3 bass', 'set instrument volume 0.0 - 1.0'], 
    ['rand bass', 'randomize instrument pattern after each cycle'],
    ['rand 2 inst', 'randomize instrument pattern after 2 cycles. more are possible..'],
    ['rand 0 bass', 'delete randomize'],
    ['&nbsp;', '&nbsp;'], 
    ['delete bass', 'delete instrument'],
    ['delete bass metal drums', 'delete multiple instruments at the same time'],
    ['&nbsp;', '&nbsp;'], 

    ['<b>Parts:</b>', ''],
    ['save part', 'save current patterns as a part. the part shows up below the input field.'],
    [': part', 'reload saved part'],
    ['delete part', 'delete saved part'],
    ['clear', 'delete all saved parts'],
    ['&nbsp;', '&nbsp;'], 


    
];



help.pattern = [
    ['Patterns:', ''], 

    ['<b> > bass #-#-#3# </b>', 'example pattern, explanation below:'],
    ['&nbsp;', '&nbsp;'], 

    ['#', 'symbol "#" means a note hit. You will hear something'],
    ['-', 'symbol "-" means silence. You will hear nothing'],
    ['#2', 'symbol "#" + "3" means a transposed note hit. You will the same note, just higher. Try from 2-30. '],
    ['#2-#--###', 'this is a combined pattern. the events are played and the pattern restarts once it is finished -  a loop'],
    ['&nbsp;', '&nbsp;'], 
    ['&nbsp;', '&nbsp;'], 
    ['&nbsp;', '&nbsp;'], 


    ['<b> > bass (-)4 (#-#)3 ##- </b>', 'example pattern, explanation below:'],
    ['&nbsp;', '&nbsp;'], 
    ['(-)4', 'the "-" in round brackets will be repeated 4 times'],
    ['(#-#)3', 'the pattern "#-#" in round brackets will be repeated 3 times'],
    ['(#-#)3 ##-', 'both patterns are combined:  3 times "(#-#)" and once "##-". Together "#-# #-# #-# ##-"'],
    ['&nbsp;', '&nbsp;'], 

    ['see examples at "help examples"', '']
];


help.instruments = [
    ['Instruments:', ''], 
    
    ['bass',    'Tone.js DuoSynth'],
    ['metal',   'Tone.js MetalSynth'],
    ['drums',   'Tone.js MembraneSynth'],
    ['string',  'Tone.js AMSynth'],
    ['acid',    'Tone.js MonoSynth'],
    ['pad',     'Tone.js Synth'],
    
    ['&nbsp;', '&nbsp;'],
    ['<b>Sampler: </b>', ''],
    ['&nbsp;', '&nbsp;'],

    ['s_ambient',   'Tone.js Sampler at ambient[&nbsp;]'],
    ['s_bass',      'Tone.js Sampler at bass[&nbsp;]'],
    ['s_fx',        'Tone.js Sampler at fx[&nbsp;]'],

    ['s_hh',        'Tone.js Sampler at hh[&nbsp;]'],
    ['s_hit',       'Tone.js Sampler at hit[&nbsp;]'],
    ['s_kick',      'Tone.js Sampler at kick[&nbsp;]'],
    ['s_loop',      'Tone.js Sampler at loop[&nbsp;]'],
    ['s_mix',       'Tone.js Sampler at mix[&nbsp;]'],
    ['s_noise',       'Tone.js Sampler at noise[&nbsp;]'],
    ['s_perc',       'Tone.js Sampler at perc[&nbsp;]'],

    ['s_snare',     'Tone.js Sampler at snare[&nbsp;]'],
    ['s_voc',        'Tone.js Sampler at vocs[&nbsp;]'],
    
];


help.files = [
    ['Files:', ''], 
    
    
    ['list folders', 'list sample folders from server. a number shows how many files it contains.'],
    ['list kick', 'list specific folder "kick" from server. a number shows how many files it contains.'],
    ['list all', 'list all sample folders and files from server'],
    ['s_kick = kick[1]', 'assign new sample to s_kick'],
    ['upload', 'upload .mp3 file to server. Will be stored at "default" (max. size 100 KB)'],
    ['upload ambient', 'upload .mp3 file to server at specific folder "ambient" (max. size 100 KB) '],
    ['record start', 'start a recording of the master sound.'],
    ['', 'records exclude interaction alerts'],
    
    ['record stop', 'stop and deliver master recording, it will show up at the Top of the page. Download Link included. Sorry: only in .ogg format'],

    ['&nbsp;', '&nbsp;'],
    ['<b>Presets: </b>', ''],
    ['store preset name123', 'store your preset on server, the name can contain small letters+numbers'],
    ['', 'Remember your preset-name. it will not be shown again..'],
    ['', 'Previous presets with the same name will be replaced.'],
    ['reload preset name123', 'reload your preset from the server.'],
];



help.examples = [
    ['Examples:', ''], 

    ['> drums ', 'init & play the instrument "bass" with the default pattern "#"'], 
    ['> bass #1#2#3#4 --#123-', 'set the pattern "#1#2#3#4 --#123-" to "bass"'], 
    ['> drums #-#-#-##3', 'init & play the instrument "drums" with the pattern "#---"'], 
    ['. bass', 'stop instrument "bass"'], 
    ['save beat', 'save current instruments & patterns as part "beat", displayed below input field'],
    ['> metal -#-#', 'init & play the instrument "metal" with the pattern "-#-#"'], 
    ['. ', 'stop all instruments'], 
    ['> ', 'play all instruments'], 
    ['vol 0.9 bass ', 'set volume for "bass", default volume is 0.7'], 
    ['vol 0.3 metal ', 'set volume for "metal", default volume is 0.7'], 
    ['save song', 'save current instruments & patterns as part "song"'],
    ['save xyz', 'save current instruments & patterns as part "xyz" (any name is possible)'],
    ['. drums', 'stop instrument "drums"'], 
    ['bpm 220 2.2', 'set bpm to 220, in a ramp of 2.2 seconds '],
    ['bpm 120', 'set bpm immediately, default bpm is 120, is not stored in parts'],
    ['> ', 'play all instruments'], 
    ['bass > drums', 'copy pattern from "bass" to "drums"'],
    ['> drums #-#-#-##3', 'play the instrument "drums" with the pattern "#---"'], 
    [': beat', 'reload instruments & patterns from part "beat"'],
    [': song', 'reload instruments & patterns from part "song"'],
    ['bass (#3#6#9-)3 (##33)2', 'set new pattern to "bass"'],
    ['rand bass', 'randomize "bass"s pattern after every cycle'],
    ['record start', 'start recording'],
    ['record stop', 'stop recording, file player & download at the top of the page'],
    ['. ', 'stop all instruments'], 

    // ['&nbsp;', '&nbsp;'], 

    // ['join nathan', 'join group session as "nathan"'],
    // ['reset', 'reset everything to zero, to start fresh with other group members'],
];

help.session = [
    ['Session:', ''], 
    ['...', 'it is possible to have an online group session. there will be latency, but if you are in the same room, just switch the sound off on every machine but one.'], 
    ['', 'to exit the session, just reload the browser.'], 
    ['&nbsp;', '&nbsp;'], 
    ['join nathan', 'join an online group session as "nathan"'],
    ['reset', 'online session needs to reset everything to zero, to start fresh with other group members'],
    ['join guest', 'join an online group session as a "guest". you will hear & see, but you can\'t interact'],
];


export { help }
