
import p5 from 'p5';
import 'p5/lib/addons/p5.sound.min';
import 'p5/lib/addons/p5.dom.min';

// FINALLY WORKING!!!!!!



const print = (o) => {
	console.log(`func from outside, passing to inside`);
	return "(1) --> most amazing val from outside";
};

let myp5 = new p5(( sketch ) => {

  let x = 100;
  let y = 100;
  let click, looper1;
  let clickUrl = require('/audio/click.mp3');
  console.log(clickUrl);
  let val = print();
  console.log(`outside val: ${val}`);

  sketch.preload = () => {
  	click = sketch.loadSound(clickUrl);
  };

  sketch.setup = () => {
    sketch.createCanvas(200, 200);
	looper1 = new p5.SoundLoop(function(timeFromNow){
		click.play(timeFromNow);
		sketch.background(255 * (looper1.iterations % 2));
	}, "8n");


	//stop after 10 iteratios;
	looper1.maxIterations = 10;
	//start the loop
	looper1.start();
  };

  sketch.draw = () => {
    //sketch.background(0);
    sketch.fill(255);
    sketch.rect(x,y,50,50);
  };
}, 'help');


