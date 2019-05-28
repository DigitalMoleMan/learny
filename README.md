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

### How to use
1. Set up a database with a table named `vocab`, the table needs two fields, an auto incrementing field called `id`, and a varchar field called `word`.
2. Create a new file with the name `db_cred.json` in `learny/_server/`. Then paste the following in the file and fill in the credentials to your database.
```json
{
	"host": "",
	"user": "",
	"password": "",
	"database": ""
}
```
3. Make sure to install the dependencies with `npm install`.
4. now you just need to `run_node.bat` to start the server. your connection should appear on the site.

* By default `main.js` is set to connect to `localhost`, if you want to change that its at the top of the file.

### Process

Most of my work went fairly smoothly and after about a week of working, the bot could learn from a dataset. However, things got harder when i started implementing the database. As of writing this the bot is in a somewhat broken state, most of the problems stem from having to reload the database when a new word is added to the vocabulary. I tried to fix the some of them by using callbacks, but to no avail. Because of this I now realize that this might not be a good use of databases.

I have made a couple of last minute fixes to make the bot a little bit less broken.

### Validation

* I got no errors on [validator.nu](https://validator.nu/?doc=https%3A%2F%2Fdigitalmoleman.github.io%2Flearny%2Findex.html)

* [wave.webaim.org](http://wave.webaim.org/report#/https://digitalmoleman.github.io/learny/index.html) reported that the input element had no form label, which I fixed by adding a title attribute to it.

### index.js

```javascript
/* - Variables - */

const net // The neural net/bot, for more info see brain.js documentation.

var vocab // Array where vocabulary loaded from database is stored.


/* - Functions - */

/**
 * Loads vocabulary from database to vocab.
 */
loadVocab()

/**
 * Inserts a word into vocab database.
 */
insertVocab()

/**
 * Calls toData() on inputMessage and outputMessage and then trains the bot on the returned data. Returns a sample result after training.
 * @param {String} inputMessage input to train on
 * @param {String} outputMessage output to train on
 */
train(inputMessage, outputMessage)

/**
 * Calls toData() on inputMessage and then
 * @param {String} inputMessage
 */
generateReply(inputMessage)

/**
 * Splits inputString Converts inputString to data and returns inputData
 * @param {String} inputString String to be converted to data
 */
toData(inputString)


/**
 * Converts inputArray to a string and returns it.
 * @param {Array} inputArray 
 */
toWords(inputArray) 

/**
 * Gets vocabIndex of word, if word isn't in vocab, word gets inserted into vocab database. Returns vocabIndex.id of word.
 * As of right now it cannot return return a word id
 * @param {String} word Single word string.
 */
getWord(word) 

/**
 * Returns vocab index of id.
 */
getId(id)
```