/**
 * 
 */

const socket = io.connect("localhost:3000");
const msgOutput = document.getElementById('output');
const msgInput = document.getElementById('input');

msgInput.addEventListener('keypress', (e) => {
	if (e.key == 'Enter') {
		send(msgInput.value);
		msgInput.value = '';
	}
})

function send(input) {
	socket.emit('send', input);
}

socket.on('result', result => {
	console.log(result);
	msgOutput.value = result;
})


restore = () => socket.emit('restore')
save = () => socket.emit('save');