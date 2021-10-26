export const tutorial = {};

tutorial.start = `



<table style="width:100%">
  
  <tr>
    <td>start the sequencer:</td>
    <td>></td>
  </tr>
  <tr>
    <td>stop the sequencer:</td>
    <td>.</td>
  </tr>
  <tr>
    <td>play instrument by name:</td>
    <td>kick</td>
  </tr>
  <tr>
    <td>stop instrument by name: </td>
    <td>. kick</td>
  </tr>
  <tr>
    <td>play with a pattern: </td>
    <td>kick #-#-#--</td>
  </tr>
  
  <tr>
    <td>play a pattern with melody: </td>
    <td>fatbass  #2 #4 #5 - #4 #3 #2</td>
  </tr>
  
  <tr>
    <td>assign pattern to multiple instruments:</td>
    <td>kick hh string #----#---</td>
  </tr>
  <tr>
    <td>copy a pattern to another instrument:</td>
    <td>string + hh</td>
  </tr>
  <tr>
    <td>set volume (0.0 - 1.0): </td>
    <td>kick 0.3</td>
  </tr>
  <tr>
    <td><b>randomizing</b> a pattern is a great way <br> 
    to get movement in the sound. You can randomize <br> 
    positions of notes in a pattern.<br>
    corresponding to the number, the pattern will be <br>
    freshly randomized after that number of cycles:</td>
    <td></td>
  </tr>
  <tr>
    <td>set random:</td>
    <td>kick &3</td>
  </tr>
  <tr>
    <td>set multiple values (instrument, <br> volume, pattern, random):</td>
    <td>kick 0.5 #-#3#2#3--   &4</td>
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
    <td><b>snapshots</b> are great to compose.<br> they save the current instruments and Bpm. <br> choose any name, as long as its <br> not an instrument name:</td>
    <td></td>
  </tr>
  <tr>
    <td>save a snapshot:   </td>
    <td>= someName</td>
  </tr>
  <tr>
    <td>play snapshot:  </td>
    <td>someName</td>
  </tr>
  
  <tr>
    <td><b>BPM</b> - the BPM is stored in the snapshots<br> 
    so that you can play with different speeds.<br>
    if you apply a number to the command, it <br>
    will take some seconds to smoothly change the BPM:</td>
    <td></td>
  </tr>
  <tr>
    <td>change BPM: </td>
    <td>bpm 80</td>
  </tr>
  <tr>
    <td>change BPM over 2 seconds: </td>
    <td>bpm 80 2</td>
  </tr>

  <tr>
    <td><b>recording</b> (on desktop, not on smartphone): <br>
    hit the record button (or type the command) to <br> 
    record what you hear. <br>
    and once you stopped it you can download the <br>
    .webm file webm appearing below the record button. </td>
    <td></td>
  </tr>
  <tr>
    <td>start recording: </td>
    <td>record start</td>
  </tr>
  <tr>
    <td>stop recording: </td>
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
