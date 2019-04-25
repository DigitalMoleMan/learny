const brain = require('brain.js');
const fs = require('file-system');

const port = 3000; // server port;
const io = require('socket.io')(port); //server start


const config = {
	binaryThresh: 0.5,
	hiddenLayers: [10, 20, 10], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

const net = new brain.recurrent.LSTM(config);

var vocab = new Array;

var trainingOptions = {
	file: 'training_1.json',
	load: false,
	save: false
}

var vocabOptions = {
	file: 'vocab_1.json',
	load: false,
	save: false
}

loadTraining();

loadVocab();

const initData = require('./data.json');

var trainingMode = true

while (trainingMode) {

	var index = Math.floor(Math.random() * initData.length);

	if (index == initData.length) index--;

	var result = train(initData[index], initData[index + 1])

	if (result == initData[index + 1]) {
		saveTraining();

		initData.splice(index, 2);
		io.emit('message', result);
	}
}

io.on("connection", socket => {
	console.log(`[SERVER]	${socket.id} connected`);

	socket.on('sendMessage', (clientMessage) => {
		var reply = generateReply(clientMessage)
		socket.emit('message', reply);
	});

	// Commands
	socket.on('save', () => saveTraining())
	socket.on('load', () => loadTraining())
	socket.on('toggleTraining', () => trainingMode = !trainingMode);

	socket.on('disconnect', (reason) => console.log(`[SERVER]	${socket.id} disconnected - ${reason}`));
});

function toData(wordArr) {
	var data = new Array;

	wordArr.forEach(word => {
		//console.log(`[VOCAB]	word: ${word}`);
		if (!vocab.includes(word)) {
			vocab.push(word);
			//console.log(vocab);
		}

		data.push(vocab.indexOf(word));
	});

	return data
}

function toWords(dataArr) {
	var words = new Array;
	//console.log(dataArr);
	for(i=0;i<dataArr.length;i++){
			words.push(vocab[dataArr[i]]);
			console.log(words);
	}

	return words
}


/**
 * @function train trains the net on [inputMessage] and [outputMessage] after converting them to [inputData] and [outputData].
 * @param {String} inputMessage 
 * @param {String} outputMessage 
 */
function train(inputMessage, outputMessage) {



	var inputData = inputMessage.toLowerCase().split('');
	var outputData = outputMessage.toLowerCase().split('');


	//console.log(`	inputData: ${inputData}`);
	//console.log(`	outputData: ${outputData}`);

	loadTraining();



	net.train([{
		input: inputData,
		output: outputData
	}], {
		errorThresh: 0.011,
		iterations: 20000,
		log: false,
		logPeriod: 100,
	});


	var trainResult = net.run(inputData);

	console.log(`[BOT]	sampleOutput: ${trainResult}`);

	return trainResult;
}


/**
 * @function generateReply generates and returns a String by running [inputMessage].
 * @param {String} inputMessage 
 */
function generateReply(inputMessage) {
	var inputData = inputMessage.split('');
	var reply = net.run(inputData, {
		errorThresh: 0.015,
		iterations: 20000,
		log: false,
		logPeriod: 100,
	});
	return reply
}

/**
 * @function saveTraining saves the current neural net to net.json
 * TODO: move training data to a database.
 * TODO: implement net "version control" in order to undo bad training.
 */
function saveTraining() {
	if (trainingOptions.load) {
		fs.writeFileSync(`${trainingOptions.file}`, JSON.stringify(net.toJSON()), (err) => {
			if (err) throw err;
		});
		console.log(`[TRAINING]	SAVED to ${trainingOptions.file}`);
	}
}


/**
 * @function loadTraining loads a previously saved neural net from net.json
 * TODO: move training data to a database.
 */
function loadTraining() {
	if (trainingOptions.load) {
		net.fromJSON(JSON.parse(fs.readFileSync(`${trainingOptions.file}`, "utf8")));
		console.log(`[TRAINING]	LOADED from ${trainingOptions.file}`);
	}
}


function saveVocab() {
	if (vocabOptions.save) {
		fs.writeFileSync(`vocab_1.json`, JSON.stringify(vocab), (err) => {
			if (err) throw err;
		});
		console.log(`[VOCAB]	SAVED to vocab_1.json`);
	}
}

function loadVocab() {
	if (vocabOptions.load) {
		vocab = JSON.parse(fs.readFileSync(`vocab_1.json`, "utf8"));
		console.log(`[VOCAB]	LOADED from vocab_1.json`);
	}
}