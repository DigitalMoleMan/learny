const brain = require('brain.js');
const fs = require('file-system');

var port = 3000;
var io = require('socket.io')(port); //server start

const net = new brain.recurrent.LSTM();
//net.fromJSON(JSON.parse(fs.readFileSync("net.json", "utf8")));
console.log("Loaded net from net.json");
var messages = new Array; //log of all messages sent.

io.on("connection", socket => {
	socket.emit("msgLog", messages);
	console.log(socket.id + 'connected');

	

	socket.on("send", message => {
		read(message);
	});

	socket.on("save", () => saveNet())

	socket.on("disconnect", (reason) => {
		console.log(socket.id + 'disconnected - ' + reason);
	})

	
});

function read(message) {
	var input = messages[messages.length - 1];
	var inArray = new Array;
	
	for (i = 0; i < input.length; i++) {
		inArray.push(input.charCodeAt(i));
	}

	console.log(inArray);
	var output = message;
	var outArray = new Array;

	for (i = 0; i < output.length; i++) {
		outArray.push(output.charCodeAt(i));
	}

	console.log(outArray);

	console.log('Training on INPUT: ' + input + ' OUTPUT: ' + output);
	train(inArray, outArray);
	console.log('Trained');


	messages.push(output);


	var reply = net.run(inArray);
	var reArray = new Array;
	for(i=0;i<reply.length;i++){
		reArray.push(Math.round(reply[i]))
	}
	console.log(reArray);
	var out = String.fromCharCode.apply(null, reArray);
	say(out);
}

function train(input, output) {
	net.train([{
		input: input,
		output: output
	}], {
		iterations: 20000
	})
}

function say(message) {
	console.log('Learny: ' + message);
	io.emit("reply", message);
	messages.push(message);
}

function saveNet() {
	fs.writeFile("net.json", JSON.stringify(net.toJSON()));
	console.log('net saved');
}