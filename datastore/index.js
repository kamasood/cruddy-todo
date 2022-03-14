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
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw 'cannot write todo file';
        } else {
          callback(null, {text: text, id: counterID});
        }
      });
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
      callback(err, files.map((fileName) => {
        let id = fileName.slice(0, -4);
        return {id: id, text: id};
      }));
    }
  });
};

exports.readOne = (id, callback) => {
  var text = items[id];
  if (!text) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    callback(null, { id, text });
  }
};

exports.update = (id, text, callback) => {
  var item = items[id];
  if (!item) {
    callback(new Error(`No item with id: ${id}`));
  } else {
    items[id] = text;
    callback(null, { id, text });
  }
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
