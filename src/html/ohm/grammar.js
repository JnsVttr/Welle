
// WELLE - input grammar //
// =============================================================

/*
https://github.com/harc/ohm
use the online tester 

save grammar as const var. will be used at semantics.js
grammar reads from top to bottom
adding a command needs cmd and destiation function
*/


const grammarText = `
livecode {
    Exp =   Sequence | Controls | General | SequenceDirect

    /*
      TRANSPORT SEQUENCE & CONTROLS
    */

    SequenceDirect = InstrumentList Pattern? PatternRandom? --seqPatternDirect

    Sequence = Command InstrumentList? Pattern? PatternRandom? --seqPattern
    

    Command =
        | "play"            --playSeq
        | ">"               --playSeqPlus
        | "stop"            --stopSeq
        | "."               --stopSeqPlus
        | "for" intPos      --forSeq
        | "in" intPos       --inSeq
        | "reset"           --reset

    General = 
        | "store preset" alnum+ 	--storePreset
        | "reload preset" alnum+ 	--reloadPreset
        | "save" alnum+         	--savePart
        | "delete" InstrumentList 	--deleteElement
        | ":" alnum+            	--setPart
        | "mute on"             	--muteOn
        | "mute off"            	--muteOff
        | "record start"        	--recordStart
        | "record stop"         	--recordStop
        | "upload" alnum+       	--uploadFiles
        | "upload"              	--uploadDefault
        | "restart server"      	--restart
        | "join" InstrumentList 	--joinName


    Controls =
        | instrument ">" InstrumentList         	--copyPattern
        | instrument "=" instrument "[" intPos "]"  --initInstrument
        | "list" instrument                     	--listInstruments
        | "sel" instrument intPos?               	--selectInstrument
        | "vol" floatPos InstrumentList          	--setInstrumentVolume
        | PatternRandom InstrumentList           	--assignRandom
        | InstrumentList Pattern PatternRandom? 	--assignPattern
        | "show" instrument                     	--showInstrument
        | "bpm" intPos floatPos?                  	--bpm
        | "help" alnum+                         	--helpText
        | "help"                                	--help
        | "clear"                               	--clear

        
    Pattern = NonemptyListOf<EventPattern, ""> 		--extractPattern

    EventPattern = 
        | Events 
        | NestedEvents 
    
    NestedEvents = "(" NonemptyListOf<Events, ""> ")" intPos? 
    
    Events =
        | "#" int?	    --soundNote
        | "-"           --soundPause

    instrument =
        | letter+ "_"? (letter+)? intPos? --instDrum

    PatternRandom =
        | "rand" "off"      --randomizeOff
        | "rand" intPos?    --randomize
        
    InstrumentList = NonemptyListOf<instrument, ""> 	--instrumentsList
    InstrumentRepeat = instrument intPos?  				--instrumentEntry

  
    /*
      HELPERS
    */
    
    floatPos = digit* "." digit+    --fullFloatPos
        | digit "."                 --dotPos
        | digit+                    --intPos
    float = "-"? digit* "." digit+  --fullFloat
        | "-"? digit "."            --dot
        | "-"? digit+               --int
    intPos = digit+                 --intPos
    int = "-"? digit+               --int

}
`;


export default grammarText;