var http = require('http');
var fs = require('fs');

// Loading the index file . html displayed to the client
var server = http.createServer(function(req, res) {
    fs.readFile('./DualShock.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
	if(req.url == '/index.html'){
    //index.html
	fs.readFile('./index.html', 'utf-8', function(error, content) {
        res.writeHead(200, {"Content-Type": "text/html"});
        res.end(content);
    });
	}
	
});
// Loading socket.io
var io = require('socket.io').listen(server);
var axisNumber="0",axisValue=0,buttonNumber="0",buttonValue="0";
// When a client connects, we note it in the console
io.sockets.on('connection', function (socket) {
    console.log('A client is connected!');
	socket.emit('message', 'You are connected!');
	infoLEDgreen.pwmWrite(255); // show client connected
	// When the server receives a “message” type signal from the client   
    socket.on('message', function (message) {
    console.log('A client is speaking to me! They’re saying: ' + message);
    }); 
	
	/*
	//get axis and button values
	socket.on('joystickData',function(data) {
    // do something with data
		axisNumber =data.axisNumber;
		axisValue =data.axisValue;
		buttonNumber =data.buttonNumber;
		buttonValue=data.buttonValue;
       console.log("Axis name is: " + axisNumber);
	   console.log("Axis value is: " + axisValue);
       console.log("Button name is: " + buttonNumber);
	   console.log("Button value is: " + buttonValue);
	   //send back this data to client to display on HTML to see how values sent
	   socket.emit('joystickDataFromServer',{ axisNumber: axisNumber, axisValue: axisValue, buttonNumber: buttonNumber, buttonValue: buttonValue });
	});
	*/
	
	//get axis values
	socket.on('joystickAxisData',function(AxisArray) {
    // do something with data
		axisNumber = 0;
		axisValue =AxisArray[0];
		if(infoLEDred.digitalRead()){ infoLEDred.digitalWrite(0);} // show axis data arrived
			else{infoLEDred.digitalWrite(1);}
       console.log("Axis data: " + String(AxisArray) );
	   console.log("Axis Num: " + axisNumber + " Axis value: "+ axisValue );
       //send back this data to client to display on HTML to see how values sent
	   socket.emit('joystickAxisDataFromServer',AxisArray);
	   if(AxisArray[1]>0.1){
		   leftmotorREVERSE.pwmWrite( Math.round(255*AxisArray[1]) );
		   leftmotorFORWARD.pwmWrite( 0);//needed to not turn motor to other direction
	   } 
	   else if (AxisArray[1]<-0.1){
		leftmotorREVERSE.pwmWrite(0);//needed to not turn motor to other direction
		 leftmotorFORWARD.pwmWrite(Math.round(255*-AxisArray[1]));
	   }
	    else {leftmotorREVERSE.pwmWrite(0);leftmotorFORWARD.pwmWrite( 0);
		}

	   if(AxisArray[3]>0.1){
		   rightmotorREVERSE.pwmWrite( Math.round(255*AxisArray[3]) );
		   rightmotorFORWARD.pwmWrite( 0);//needed to not turn motor to other direction
	   } 
	   else if(AxisArray[3]<-0.1){
		rightmotorREVERSE.pwmWrite(0);//needed to not turn motor to other direction
		rightmotorFORWARD.pwmWrite(Math.round(255*-AxisArray[3]) );
	   }else
		{rightmotorREVERSE.pwmWrite(0);rightmotorFORWARD.pwmWrite( 0);
		}
	      
           
	   if(AxisArray[0]>0.1){
		   servo.servoWrite( 1500 + Math.round(500*AxisArray[0]) );
	   } 
	   else if(AxisArray[0]<-0.1){
		servo.servoWrite( 1500 + Math.round(500*AxisArray[0]) );
	   }else
		{servo.servoWrite(1500);
		}
	   //
	   if(AxisArray[2]>0.1){
		   servo2.servoWrite( 1500 + Math.round(500*AxisArray[2]) );
	   } 
	   else if(AxisArray[2]<-0.1){
		servo2.servoWrite( 1500 + Math.round(500*AxisArray[2]) );
	   }else
		{servo2.servoWrite(1200);
		}
	   
	   
	   var maxaxis03=0; //maximum value of axis 0 or 3. if it's below 
	   maxaxis03=Math.max( 255*Math.abs(AxisArray[3]),255*Math.abs(AxisArray[1]))
	   if (maxaxis03>50){	   
	   vibroMOTOR.pwmWrite(Math.round(0.5*Math.round(maxaxis03)));
	   }else {vibroMOTOR.pwmWrite(50);}

	   if( ( 255*Math.abs(AxisArray[3]) > 255*Math.abs(AxisArray[1]) ) && (maxaxis03>20))
		{		 leftfrontLED.pwmWrite(255*Math.round(Math.abs(AxisArray[3])));
		 		 rightfrontLED.pwmWrite(0);
		}else if ( (255*Math.abs(AxisArray[3]) < 255*Math.abs(AxisArray[1]) ) && (maxaxis03>20))
		 {leftfrontLED.pwmWrite(0);
		  rightfrontLED.pwmWrite(255*Math.round(Math.abs(AxisArray[1])));
		}
		else{
		 leftfrontLED.pwmWrite(150);
		 rightfrontLED.pwmWrite(150);
		}
		   
	});

	//get button values
	socket.on('joystickButtonData',function(ButtonsArray) {
    // do something with data
		buttonNumber =0;
		buttonValue=ButtonsArray[0];
       infoLEDblue.pwmWrite(255); // show button data arrived
	   console.log("Buttons data: " + String(ButtonsArray) );
	   console.log("Button Num: " + buttonNumber + " Button value: "+ String(buttonValue) );
	   //send back this data to client to display on HTML to see how values sent
	   socket.emit('joystickButtonDataFromServer',ButtonsArray);  
	   infoLEDblue.pwmWrite(0); // show button data arrived
	   
	   if(ButtonsArray[9]){infoLEDblue.pwmWrite(0);}
	   if(ButtonsArray[10]){infoLEDblue.pwmWrite(255);}
	   //vibroMOTOR.pwmWrite(200);
	});
	
});

server.listen(8080);


const Gpio = require('pigpio').Gpio;
const led = new Gpio(17, {mode: Gpio.OUTPUT});
const leftmotorREVERSE = new Gpio(24, {mode: Gpio.OUTPUT});
const leftmotorFORWARD = new Gpio(23, {mode: Gpio.OUTPUT});
const rightmotorREVERSE = new Gpio(22, {mode: Gpio.OUTPUT});
const rightmotorFORWARD = new Gpio(27, {mode: Gpio.OUTPUT});

const infoLEDred = new Gpio(13, {mode: Gpio.OUTPUT});
const infoLEDgreen = new Gpio(19, {mode: Gpio.OUTPUT});
const infoLEDblue = new Gpio(26, {mode: Gpio.OUTPUT});

const vibroMOTOR = new Gpio(25, {mode: Gpio.OUTPUT});

const leftfrontLED = new Gpio(16, {mode: Gpio.OUTPUT});
const rightfrontLED = new Gpio(20, {mode: Gpio.OUTPUT});

const servo = new Gpio(21, {mode: Gpio.OUTPUT});
const servo2 = new Gpio(12, {mode: Gpio.OUTPUT});

let dutyCycle = 0;
 

//IO name is const name from above like. step is negative or positive.
function IOupdate(step)
{ PWMdutyCycle= step*255
  if (PWMdutyCycle > 255) {PWMdutyCycle = 255;}
  if (PWMdutyCycle <= 0) {PWMdutyCycle = 0;}
  return PWMdutyCycle;
}
/*
setInterval(() => {
  //adjust blightness of LED
		dutyCycle=Math.round(dutyCycle + 20*axisValue);
		//console.log("dutyCycle: " + dutyCycle); 
  if (dutyCycle > 255) {
    dutyCycle = 255;
  }
  if (dutyCycle <= 0) {
    dutyCycle = 0;
  }
  led.pwmWrite(dutyCycle);

}, 20);
*/