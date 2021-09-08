export const tutorial = {};

tutorial.start = `

Get to know WELLE. It is basically a text-based 8-step sequencer with predefined sample sounds. 
You can input commands in the input field (console) to make music. 
You can save and recall snapshots of your music on-the-fly.
Also you can record your music. Or send it as MIDI messages to your preferred DAW 
(the MIDI channels correspond to the order of the samples).
<br>
<br>
In WELLE a pattern is a combination from a note "#" and a pause "-". 
A note can have a number behind it, e.g. "#3" or "#-12", 
so it is higher or lower than the default "#".
If you enter a pattern shorter than 8 notes, it will be repeated to fill 8 steps.
If your pattern is longer than 8 notes, it will be reduced to 8 steps.


<br>
<br>
Use the arrow keys (up & down)  to recall and modify  previous input.
<br>
<br>
HAVE FUN !
<br>
<br>
<br>

<table style="width:100%">
  
  <tr>
    <td>start instrument by name:</td>
    <td>kick</td>
  </tr>
  <tr>
    <td>stop instrument by name: </td>
    <td>. kick</td>
  </tr>
  <tr>
    <td>start with pattern: </td>
    <td>kick #-#-#--</td>
  </tr>
  
  <tr>
    <td>pattern with melody: </td>
    <td>kick #2 #4 #5 - #4 #3 #2</td>
  </tr>
  
  <tr>
    <td>start multiple instruments:</td>
    <td>kick hh string #----#---</td>
  </tr>
  <tr>
    <td>set volume (0.0 - 1.0): </td>
    <td>kick 0.3</td>
  </tr>
  <tr>
    <td>set random (new random <br>pattern after 3 plays):</td>
    <td>kick %3</td>
  </tr>
  <tr>
    <td>set multiple values (name, <br> volume, pattern, random):</td>
    <td>kick 0.5 #-#3#2#3--   %4</td>
  </tr>
  <tr>
    <td>start all:</td>
    <td>></td>
  </tr>
  <tr>
    <td>stop all:</td>
    <td>.</td>
  </tr>
  <tr>
    <td>save part (choose your on name,<br>  as long as its not an instrument name):   </td>
    <td>: somepart</td>
  </tr>
  <tr>
    <td>play part:  </td>
    <td>somepart</td>
  </tr>
  <tr>
    <td>delete instrument or part: </td>
    <td>/ kick</td>
  </tr>
  <tr>
    <td>delete multiple instruments or parts: </td>
    <td>/ kick somepart hh</td>
  </tr>
  <tr>
    <td>delete all: </td>
    <td>/ </td>
  </tr>
  <tr>
    <td>start recording: </td>
    <td>record start</td>
  </tr>
  <tr>
    <td>stop recording (download file <br> below record button): </td>
    <td>record stop</td>
  </tr>
</table>
`;

/*

<h3 class="w3-medium">Overview</h3>



<h3 class="w3-medium">Start</h3>
<p>
    Welle is an accessible web-based music environment based on pattern notation.
    The main element is the 'console', an input field, which can be used to enter music commands, 
    e.g. starting or stopping instruments, assign different sound patterns, volume, 
    randomization, etc.
</p>
<p>
    To start we will exercise some of the basic commands to create some sound. 
    Please try to write one of the following notations in the input field below and hit enter 
    (this will start the according instrument and stop it after a short loop): <br>
    <code>hh</code>, <code>drum</code>, <code>kick</code>, <code>string</code>
</p>
<p>
    <input
        class="tutorialInput"
        type="text"
        size="50"
        title="tutorial"
        autocomplete="off"
        value=""
    />
</p>
<p> all available instruments are listed at the top of this page. </p>



<h3 class="w3-medium">Pattern</h3>
<p>
    Now let's try to add a pattern to the instrument. A pattern consists of two symbols, a '#' for a note 
    and a '-' for a pause. A pattern is a combination of both, e.g. <code>#---##-#--#-</code>. 
    The pattern has to be written after the instrument's name, with an empty space in between.
</p>
<p> 
    Try to create a pattern for the 'hh' instrument with different rhythms. Type in the input field below for example: <br>
    <code>hh #-#---#-</code>
</p>
<p>
    <input
        class="tutorialInput"
        type="text"
        size="50"
        title="tutorial"
        autocomplete="off"
        value=""
    />
</p>
*/
