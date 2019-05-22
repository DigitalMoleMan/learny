const brain = require('brain.js');
const fs = require('file-system');

const mysql = require('mysql');
const mysqlCon = mysql.createConnection(JSON.parse(fs.readFileSync('db_cred.json')));

mysqlCon.connect((err) => {
	if (err) throw err;
	console.log(`[MYSQL] Connected`);
});

const ioPort = 3000; // server port;
const io = require('socket.io')(ioPort); //server start

const config = {
	binaryThresh: 0.5,
	hiddenLayers: [10, 20, 10], // array of ints for the sizes of the hidden layers in the network
	activation: 'sigmoid', // supported activation types: ['sigmoid', 'relu', 'leaky-relu', 'tanh'],
	leakyReluAlpha: 0.01 // supported for activation type 'leaky-relu'
};

const net = new brain.recurrent.LSTM(config);

var vocab = []
loadVocab();

var trainingOptions = {
	file: 'training/ver_2.json',
	load: true,
	save: true
}

var vocabOptions = {
	file: 'vocab/vocab_1.json',
	load: true,
	save: false
}

loadTraining();

//loadVocab();

//console.log(vocab)
const initData = require('./data.json');


var trainingMode = false;

/**
 * @param {function} callback
 */
getWord = (word, callback) => {
	var vocabIndex
	try {
		vocabIndex = vocab[vocab.findIndex(elmt => elmt.word === word)].id;
	} catch {
		insertVocab(word, loadVocab(() => vocabIndex = vocab[vocab.findIndex(elmt => elmt.word === word)].id));
	}
	console.log(vocabIndex);
	callback(vocabIndex);

}
getId = (id) => vocab[vocab.findIndex(elmt => elmt.id === id)];

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
		console.log(`[SERVER] ${socket.id}: ${clientMessage}`);
		var reply = generateReply(clientMessage)
		socket.emit('message', reply);
	});

	// Client commands
	socket.on('save', () => saveTraining())
	socket.on('load', () => loadTraining())
	socket.on('toggleTraining', () => trainingMode = !trainingMode);

	socket.on('disconnect', (reason) => console.log(`[SERVER] ${socket.id} disconnected - ${reason}`));
});


/**
 * converts a string to input/output data
 * @param {String} input 
 */
function toData(input) {

	var wordArr = input.toLowerCase().split(' ');
	var data = new Array;

	wordArr.forEach((word) => {
		getWord(word, (wordId) => data.push(wordId));

	});
	console.log(data);
	return data;
}

/**
 * converts input/output data to a string
 * @param {Array} dataArr 
 */
function toWords(dataArr) {
	var words = new String;

	for (i = 0; i < dataArr.length; i++) {
		(getId(dataArr[i]) != undefined) ? words += getId(dataArr[i]).word: console.log('undefined word:' + dataArr[i]);
	};

	return words
}


/**
 * @function train trains the net on inputMessage and outputMessage after converting them to inputData and outputData.
 * @param {String} inputMessage 
 * @param {String} outputMessage 
 */
function train(inputMessage, outputMessage) {



	var inputData = toData(inputMessage)
	var outputData = toData(outputMessage);


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


	var trainResult = toWords(net.run(inputData));

	console.log(`[BOT] afterOutput: ${trainResult}`);
	console.log(`---------------------------------`)


	return trainResult;
}


/**
 * @function generateReply generates and returns a String by running [inputMessage].
 * @param {String} inputMessage 
 */
function generateReply(inputMessage) {
	var inputData = toData(inputMessage);

	//console.log(net.run(initData));
	//inputData.forEach(id => console.log(getId(id).word));
	var reply = toWords(net.run(inputData));
	console.log(`[BOT] reply: ${reply}`);
	return reply
}

/**
 * @function saveTraining saves the current neural net to net.json
 * TODO: move training data to a database.
 * TODO: implement net "version control".
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

function insertVocab(input, callback) {
	mysqlCon.query(`INSERT INTO vocab (word) VALUES ('${input}');`, (err) => {
		if (err) throw err;
		if(callback != undefined) callback();
	});

}

function loadVocab(callback) {
	mysqlCon.query(`SELECT * FROM vocab`, function (err, result) {
		if (err) throw err;
		vocab = result

		console.log(`[MYSQL] Loaded vocab from database:`);
		console.log(vocab);

		if(callback != undefined) callback();
	});
}