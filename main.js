/**
 * 
 */

 //Server connection

const ip = 'localhost'; //server ip
//const ip = '192.168.27.248';
const port = 3000; //server port
const socket = io.connect(`${ip}:${port}`);


const msgOutput = document.getElementById('output');
const msgInput = document.getElementById('input');
const newLine = document.getElementById('newLine');

socket.on('connect', () => addLine(`Connected to server on ${ip}:${port}`))

socket.on('message', (message) => addLine(`learny>${message}`))

document.addEventListener('mouseup', () => msgInput.focus())


msgInput.addEventListener('keypress', (e) => {
	if (e.key == 'Enter') {
		sendMessage(msgInput.value);
	}
})

/**
 * @function addLine posts a new line in the log
 * @param {String} input 
 */
function addLine(input) {
	var span = document.createElement('span');
	span.className = 'line';
	span.innerHTML = input;
	console.log(input);
	document.body.insertBefore(span, newLine);
	document.body.insertBefore(document.createElement('br'), newLine);
}

/**
 * @function sendMessage sends [message] to the server 
 * @param {String} message
 */
sendMessage = (message) => {
	socket.emit('sendMessage', message);
	addLine(`>${msgInput.value}`);
	msgInput.value = '';
	msgInput.scrollIntoView();
}

toggleTraining = () => socket.emit('toggleTraining');