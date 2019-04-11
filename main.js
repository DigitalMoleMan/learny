/**
 * 
 */

const ip = 'localhost';
const port = 3000;

const socket = io.connect(`${ip}:${port}`);
const msgOutput = document.getElementById('output');
const msgInput = document.getElementById('input');
const newLine = document.getElementById('newLine');

socket.on('connect', () => {
	insert(`Connected to server on ${ip}:${port}`)
	insert('');
})

document.addEventListener('mouseup', () => {
	msgInput.focus();
})

msgInput.addEventListener('keypress', (e) => {
	if (e.key == 'Enter') {
		sendMessage(msgInput.value);
		insert(`learny>${msgInput.value}`);
		msgInput.value = '';
		msgInput.scrollIntoView();
	}
})

function insert(input) {
	var span = document.createElement('span');
	span.innerHTML = input;
	document.body.insertBefore(span, newLine);
	document.body.insertBefore(document.createElement('br'), newLine);
}


/**
 * 
 * @param {String} message
 */
function sendMessage(message){
	socket.emit('sendMessage', message);
}