const socket = io.connect("localhost:3000");

const messageLog = document.getElementById("messageLog");
const messageInput = document.getElementById("messageInput")

var messages = new Array;

socket.on('msgLog', log => {
	messageLog.innerHTML = '';
	log.forEach(msg => {
		pushMessage(msg);		
	});
})

socket.on('reply', message => {
	pushMessage(message)
});

messageInput.addEventListener('keyup', (e) => {
	if (e.key.toLowerCase() == 'enter') sendMessage(messageInput.value);
})

function sendMessage(message){
	socket.emit('send', message);
	pushMessage(message)
	messageInput.value = '';
}

function pushMessage(message){
	const p = document.createElement('p');
	p.innerHTML = message;
	messageLog.insertBefore(p, null);
}

save = () => socket.emit('save');