const brain = require('brain.js');
const fs = require('file-system');

const port = 3000; // server port;
const io = require('socket.io')(port); //server start


const config = {
	binaryThresh: 1,
	hiddenLayers: [20, 20, 20], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

const net = new brain.recurrent.LSTM(config);

//loadTraining();

const initData = require('./data.json');

var lastMessage = "hello!";

initData.forEach(element => {
	var index = Math.floor(Math.random() * initData.length);
	if (index == initData.length) index--;
	if (initData[index + 1] == train(initData[index], initData[index + 1])) saveTraining();
	
});

function forceTrain(input, output) {
	var result = '';
	while (result == '') {
		train(input, output);
		result = generateReply(input);
	}

	lastMessage = output;
}

io.on("connection", socket => {
	console.log(`${socket.id} connected`);

	//socket.on('sendMessage', clientMessage => {


	// Commands
	socket.on('save', () => saveTraining())
	socket.on('load', () => loadTraining())
	socket.on('setLast', (msg) => lastMessage = msg)

	socket.on('disconnect', (reason) => console.log(`${socket.id} disconnected - ${reason}`));
});


/**
 * @function train trains the net on [inputMessage] and [outputMessage] after converting them to [inputData] and [outputData].
 * @param {String} inputMessage 
 * @param {String} outputMessage 
 */
function train(inputMessage, outputMessage) {
	//console.log(`-TRAINING-`)
	//console.log(`	inputMessage: ${inputMessage}`);
	//console.log(`	outputMessage: ${outputMessage}`);
	var inputData = inputMessage.split('');
	var outputData = outputMessage.split('');
	//console.log(`	inputData: ${inputData}`);
	//console.log(`	outputData: ${outputData}`);

	loadTraining();

	net.train([{
		input: inputData,
		output: outputData
	}], {
		errorThresh: 0.01,
		iterations: 10000,
		log: false,
		logPeriod: 100,
	});

	var trainResult = net.run(inputData)
	
	console.log(`	sampleOutput: ${trainResult}`);
	
	//io.emit("message", trainResult);
	return trainResult;
}


/**
 * @function generateReply generates and returns a String by running [inputMessage].
 * @param {String} inputMessage 
 */
function generateReply(inputMessage) {
	var inputData = inputMessage.split('');
	var reply = net.run(inputData);
	return reply
}

/**
 * @function saveTraining saves the current neural net to net.json
 * TODO: move training data to a database.
 * TODO: implement net "version control" in order to undo bad training.
 */
function saveTraining() {

	console.log('saving');
	fs.writeFileSync("net.json", JSON.stringify(net.toJSON()), (err) => {
		if (err) throw err;
		
	});	
	console.log('SAVED');
}


/**
 * @function loadTraining loads a previously saved neural net from net.json
 * TODO: move training data to a database.
 */
function loadTraining() {
	net.fromJSON(JSON.parse(fs.readFileSync("net.json", "utf8")));
	console.log('LOADED');
}

function saveVocab() {

}

function loadVocab() {}