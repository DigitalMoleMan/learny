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

const net = new brain.recurrent.LSTM();

var lastMessage = "hello!";

io.on("connection", socket => {
	console.log(`${socket.id} connected`);

	socket.on('setLast', msg => {
		lastMessage = msg;
	})

	socket.on('save', () => saveTraining())
	socket.on('load', () => loadTraining())
	socket.on('sendMessage', clientMessage => {
		var result = '';
		while (result == '') {
			train(lastMessage, clientMessage);
			result = generateReply(lastMessage);
		}
		console.log(result);
		lastMessage = clientMessage;
	});

	socket.on('disconnect', (reason) => {
		console.log(`${socket.id} disconnected - ${reason}`);
	});
});

function train(inputMessage, outputMessage) {
	console.log(`training on input: ${inputMessage.split('')}, output: ${outputMessage.split('')}`);
	net.train([{
		input: inputMessage.split(''),
		output: outputMessage.split('')
	}], {
		errorThresh: 0.00001,
		iterations: 1000
	});
}

function generateReply(inputMessage) {
	var reply = net.run(inputMessage.split(''));
	return reply
}

function saveTraining() {
	fs.writeFile('net.json', JSON.stringify(net.toJSON()));
}

function loadTraining() {
	net.fromJSON(JSON.parse(fs.readFile('net.json', 'utf8')));
}

function saveVocab() {

}

function loadVocab() {}