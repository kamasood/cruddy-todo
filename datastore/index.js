const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {

  // var fileID;
  counter.getNextUniqueId((err, counterID) => {
    if (err) {
      throw 'unable to get nextID';
    } else {
      // console.log('CounterID: ' + counterID);
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
  // console.log(exports.dataDir);
  // console.log(fileID);
  // var filePath = path.join(exports.dataDir, fileID);
  // fs.writeFile(filePath, text, (err) => {
  //   if (err) {
  //     throw 'unable to write';
  //   } else {

  //   }
  // });
  // console.log(id);
  // items[id] = text;
  // callback(null, { id, text });
};

exports.readAll = (callback) => {
  var data = _.map(items, (text, id) => {
    return { id, text };
  });
  callback(null, data);
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
