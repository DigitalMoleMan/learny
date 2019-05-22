# Web Project

## Idea

* Neural-net chatbot using brain.js
	* Type of page: "Web toy"
	* Target group: Techies

### Modules
* [mysql](https://www.npmjs.com/package/mysql)
* [brain.js](https://github.com/BrainJS/brain.js)
* [file-system](https://www.npmjs.com/package/file-system)
* [socket.io](https://socket.io/)

### Diagram

![alt text](dia.png)

### Style

Page looking like a command prompt/terminal.
* Font:
	* Size: 16
	* Font: Consolas
* Colors: 
	* Screen Text: 192, 192, 192
	* Screen Background: 0, 0, 0
	* Popup Text: 128, 0, 128
	* Popup Background: 255, 255, 255


## Documentation

### index.js

```javascript
loadVocab() //Loads vocabulary from database to vocab.

train(inputMessage, outputMessage) //Calls toData() on inputMessage and outputMessage and then trains the bot on the returned data. Returns a sample result after training.

generateReply(inputMessage) //Calls toData() on inputMessage and then 

toData(inputString) //Splits inputString Converts inputString to data and returns inputData

toWords(inputArray) //Converts inputArray to a string and returns it.

getWord(word) //Gets vocabIndex of word, if word isn't in vocab, word gets inserted into vocab database. Returns vocabIndex of word.

getId(id) //Returns vocab index of id.
```