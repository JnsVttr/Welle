// WELLE - main index file //
// =============================================================

/*
https://github.com/harc/ohm

*/


// libraries
import io from 'socket.io-client';
import SocketIOFileClient from 'socket.io-file-client';

// files
import { livecode, semantics }  from '/html/ohm/semantic';
import { renderHtml, renderHtmlArrows, renderHtmlHelpMenu }  from  '/html/renderHTML';
import { parseInput }  from '/parse-commands';
import { help }  from '/text/helpText';
import { setDataURL, handlePresetsInTone } from '/tone/main-tone';
import { printer } from './helper/printer';
import { alerts } from './helper/alerts';
import { createAlerts } from './helper/createAlerts';


// global variables
let debug = true;
let context = "index";







export { 

}




