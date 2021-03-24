
// WELLE - grammar
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
    Exp =   Commands | Assignments  

    /*
      TRANSPORT, SEQUENCE & CONTROLS
      ==============================
      hints:
      alnum+  == all is allowed
      phrases == word (can include numbers, integers)
      oder of grammar counts, checking is top to bottom
      Upper/lower case counts with definitions, e.g. phrases but PhraseList
      single phrases are detected least, because less meaningful
    */
	


    Commands =
        | "?" PhraseList?            --questionEvent
    	| ">" PhraseList        	--playMultiEvent
        | "." PhraseList        	--stopMultiEvent
        | ":" phrase           	    --savePartEvent
        | "/" PhraseList		    --deletEvent
        | "save" phrase         	--saveEvent
        | "join" phrase 			--joinEvent
        | "restart" phrase      	--restartEvent
        | "store" phrase 			--storeEvent
        | "load" phrase				--loadEvent
        | "upload" phrase 			--uploadEvent
        | "mute"             		--muteEvent
        | "unmute"             		--unmuteEvent
        | ">"               		--playAllEvent
        | "."               		--stopAllEvent
        | "/"               		--deleteAllEvent
        
                

    Assignments =
        | phrase ">" PhraseList         --copyPattern
        | PhraseList Pattern 		    --assignPattern
        | "bpm" intPos floatPos?        --setBPM
        | PhraseList floatPos 		    --setVolume
        | PhraseList			        --playListEvent
        
        
        
    PhraseList 	= NonemptyListOf<phrase, ""> 	    --PhraseList
    
    phrase 		= letter+ "_"? (letter+)? intPos?   --phrase
    
    Pattern = NonemptyListOf<EventPattern, ""> 		--extractPattern

    EventPattern = 
        | Events 
        | NestedEvents 
    
    NestedEvents = "(" NonemptyListOf<Events, ""> ")" intPos? 
    
    Events =
        | "#" int?	                --soundNote
        | "-"                       --soundPause

        
    /*
      HELPERS - for calculation
      ==========================
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