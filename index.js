const brain = require('brain.js');
const fs = require('file-system');

const port = 3000;
const io = require('socket.io')(port); //server start

const config = {
	binaryThresh: 0.5,
	hiddenLayers: [3], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

const net = new brain.recurrent.LSTMTimeStep();
//net.fromJSON(JSON.parse(fs.readFileSync("net.json", "utf8")));
console.log("Loaded net from net.json");

var words = JSON.parse(fs.readFileSync("words.json", "utf8"));
console.log(words);

var msgLog = JSON.parse(fs.readFileSync("msgLog.json", "utf8"));

io.on("connection", socket => {
	console.log(`${socket.id} connected`);

	socket.emit('postMsgLog', msgLog);

	socket.on('send', (clientInput) => {
		console.log(clientInput)
		train(clientInput, clientOutput);
	})

	socket.on("test", (clientInput) => {
		console.log(clientInput);
		run(clientInput)
	});

	socket.on('restore', () => restoreNet());
	socket.on("save", () => saveNet());

	socket.on('disconnect', (reason) => {
		console.log(`${socket.id} disconnected - ${reason}`);
	})


});

train = (input, output) => {
	var inData = new Array;
	var outData = new Array;
	input.forEach(word => {
		if (!words.includes(word)) words.push(word);
		inData.push(words.indexOf(word))
	})

	output.forEach(word => {
		if (!words.includes(word)) words.push(word);

		outData.push(words.indexOf(word))
	})



	console.log(inData)
	console.log(outData)
	net.train({
		input: inData,
		output: outData
	}, {
		iterations: 100
	})

	fs.writeFile("words.json", JSON.stringify(words));
	//fs.writeFile("net.json", JSON.stringify(net.toJSON()));
}

function run(input) {
	var inData = new Array;
	input.forEach(word => {
		if (words.includes(word)) inData.push(words.indexOf(word));
	});
	console.log(inData);
	var outData = net.run(inData);
	console.log(outData);
	var output = new Array;
	outData.forEach(word => {
		output.push(words[Math.round(word)]);
	})
	console.log(output);
	io.emit('result', (output));
}


function restoreNet() {
	net.fromJSON(JSON.parse(fs.readFileSync("net.json", "utf8")));
	console.log("restored net from [version]")
}

function saveNet() {

	console.log('net saved to [version]');
}