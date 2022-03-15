const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId((err, counterID) => {
    if (err) {
      throw 'unable to get nextID';
    } else {
      var filePath = path.join(exports.dataDir, `${counterID}.txt`);

    }
  });
};

// I - external directory, callback function
// O - array of todo objects {id: *id*, text: *id*}
// C - error first callback pattern
// E - no file existing, return empty array

// method to access list of files in directory
// use fs.readdir(path, callback(err, files))
// call forEach on files
// remove .txt as needed
// push to an array of objects (id as properties)
// call initial callback with (error, arr)

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, (err, files) => {
    if (err) {
      throw 'cannot read files at directory';
    } else {
      callback(null, files.map((fileName) => {
        let id = fileName.slice(0, -4);
        return {id: id, text: id};
      }));
    }
  });
};


/*

I - File ID for a specific ToDo and a callback function
O - Object containing ID that matches input, and the text found within matching file
C - Error first callback pattern
E - 404

~~High Level Strategy~~
  Use fs.readfile method - aliased ID with filepath string + txt
  Use callback to deal with error case of no text in file
  Success case will build object and pass it into the provided callback

*/


exports.readOne = (id, callback) => {
  var filePath = path.join(exports.dataDir, `${id}.txt`);

  fs.readFile(filePath, (err, text) => {
    if (!text) {
      callback(new Error(`No item with ID ${id}`));
    } else {
      let textContents = text.toString();
      callback(null, {id: id, text: textContents});
    }
  });
};

// I - id, new text, callback function
// O - updated text file at same ID as provided, on success, callback updated todo object
// C - error-first callback
// E - no item with ID

// High Level
// same as create, instead of getting a unique ID, we have an ID provided

exports.update = (id, text, callback) => {

  var filePath = path.join(exports.dataDir, `${id}.txt`);

  readOne(filePath, (err, file) => {
    if (!file) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw 'cannot write todo file';
        } else {
          callback(null, {text: text, id: counterID});
        }
      });
    }
  });



  // var item = items[id];
  // if (!item) {
  //   callback(new Error(`No item with id: ${id}`));
  // } else {
  //   items[id] = text;
  //   callback(null, { id, text });
  // }
};

exports.delete = (id, callback) => {
  var item = items[id];
  delete items[id];
  if (!item) {
    // report an error if item not found
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback();
  }
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
