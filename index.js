
const express = require('express');
const app = express();
const expressPort = 3001;

const mysql = require('mysql');
const mysqlConnection = mysql.createConnection({
	host: 'localhost',
	user: 'learny',
	password: 'pass',
	database: 'learny_data'
})

mysqlConnection.connect()

const brain = require('brain.js');
const fs = require('file-system');

const ioPort = 3000; // server port;
const io = require('socket.io')(ioPort); //server start

const config = {
	binaryThresh: 0.5,
	hiddenLayers: [10, 20, 10], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

const net = new brain.recurrent.LSTM(config);

var vocab = new Array;

var trainingOptions = {
	file: 'training/ver_2.json',
	load: false,
	save: true
}

var vocabOptions = {
	file: 'vocab/vocab_1.json',
	load: true,
	save: false
}

loadTraining();

loadVocab();

//console.log(vocab)
const initData = require('./data.json');

var trainingMode = false;
/*
initData.forEach(message => {
	console.log(toWords(toData(message.toLowerCase().split(' '))));
})
*/
saveVocab();


while (trainingMode) {

	var index = Math.floor(Math.random() * (initData.length - 1));

	var result = train(initData[index], initData[index + 1])

	if (result == initData[index + 1]) {
		saveTraining();

		initData.splice(index, 2);
		io.emit('message', result);
	}
}

io.on("connection", socket => {
	console.log(`[SERVER] ${socket.id} connected`);

	socket.on('sendMessage', (clientMessage) => {
		var reply = generateReply(clientMessage)
		socket.emit('message', reply);
	});

	// Commands
	socket.on('save', () => saveTraining())
	socket.on('load', () => loadTraining())
	socket.on('toggleTraining', () => trainingMode = !trainingMode);

	socket.on('disconnect', (reason) => console.log(`[SERVER] ${socket.id} disconnected - ${reason}`));
});

function toData(wordArr) {
	var data = new String;

	wordArr.forEach(word => {
		if (!vocab.includes(word)) vocab.push(word);

		data += (vocab.indexOf(word) + " ");
	});
	//console.log(vocab);

	return data
}

function toWords(dataArr) {
	var words = new String;
	for(i=0;i<dataArr.length;i++){
		(vocab[dataArr[i]] != undefined) ? words += vocab[dataArr[i]] : console.log('undefined word:' + dataArr[i]);
	};

	return words
}


/**
 * @function train trains the net on [inputMessage] and [outputMessage] after converting them to [inputData] and [outputData].
 * @param {String} inputMessage 
 * @param {String} outputMessage 
 */
function train(inputMessage, outputMessage) {



	var inputData = toData(inputMessage.toLowerCase().split('')).split('');
	var outputData = toData(outputMessage.toLowerCase().split('')).split('');


	//console.log(`	inputData: ${inputData}`);
	//console.log(`	outputData: ${outputData}`);

	//loadTraining();

	//console.log(`[BOT] beforeOutput: ${net.run(inputData)}`);


	net.train([{
		input: inputData,
		output: outputData
	}], {
		errorThresh: 0.011,
		iterations: 20000,
		log: false,
		logPeriod: 100,
	});


	var trainResult = toWords(net.run(inputData).split(' '));

	console.log(`[BOT] afterOutput: ${trainResult}`);
	console.log(`---------------------------------`)

	
	return trainResult;
}


/**
 * @function generateReply generates and returns a String by running [inputMessage].
 * @param {String} inputMessage 
 */
function generateReply(inputMessage) {
	var inputData = toData(inputMessage.toLowerCase().split('')).split('');
	var reply = toWords(net.run(inputData).split(' '));
	console.log(`[BOT] reply: ${reply}`);
	return reply
}

/**
 * @function saveTraining saves the current neural net to net.json
 * TODO: move training data to a database.
 * TODO: implement net "version control" in order to undo bad training.
 */
function saveTraining() {
	if (trainingOptions.save) {
		fs.writeFileSync(`${trainingOptions.file}`, JSON.stringify(net.toJSON()));
		console.log(`[TRAINING] SAVED to ${trainingOptions.file}`);
	}
}


/**
 * @function loadTraining loads a previously saved neural net from net.json
 * TODO: move training data to a database.
 */
function loadTraining() {
	if (trainingOptions.load) {
		try {
			net.fromJSON(JSON.parse(fs.readFileSync(`${trainingOptions.file}`, "utf8")));
			console.log(`[TRAINING]	LOADED from ${trainingOptions.file}`);
		} catch {
			console.log(`[TRAINING] ${trainingOptions.file} not found`);
		}
	}
}


function saveVocab() {
	if (vocabOptions.save) {
		fs.writeFileSync(`${vocabOptions.file}`, JSON.stringify(vocab));
		console.log(`[VOCAB] SAVED to ${vocabOptions.file}`);
	}
}

function loadVocab() {
	if (vocabOptions.load) {
		vocab = JSON.parse(fs.readFileSync(vocabOptions.file, "utf8"));
		console.log(`[VOCAB] LOADED from ${vocabOptions.file}`);
	}
}