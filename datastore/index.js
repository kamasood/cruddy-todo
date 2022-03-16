const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
const Promise = require('bluebird');

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

const readOneAsync = Promise.promisify(exports.readOne);

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


// PHASE 2 - REFACTOR

// I - external directory
// O - promise that is a promise of all of the files inside the directory
// C - make use of promises (Promise.all)
// E -

// high level
// return promisePrime - a Promise.all for each of the files
// readOne on each of the files

exports.readAll = (callback) => {

  let myPromise = new Promise((resolve, reject) => {
    var promiseArray = [];
    fs.readdir(exports.dataDir, (err, files) => {
      if (err) {
        throw 'error reading directory';
        reject(err);
      } else {
        // console.log('ping, files returned from readdir:', files);
        for (let i = 0; i < files.length; i++) {
          promiseArray.push(readOneAsync(files[i].slice(0, -4)));
        }
        resolve(promiseArray);
      }
    });
  }).then((array) => {
    Promise.all(array)
      .then((array) => {
        callback(null, array);
      });
  });


  // Promise.all(promiseArray).then((files) => {
  //   console.log('individual files: ' + files);
  //   callback(null, files);
  // });



  // fs.readdir(exports.dataDir, (err, files) => {
  //   if (err) {
  //     throw 'cannot read files at directory';
  //   } else {
  //     callback(null, files.map((fileName) => {
  //       let id = fileName.slice(0, -4);
  //       return {id: id, text: id};
  //     }));
  //   }
  // });
};




// I - id, new text, callback function
// O - updated text file at same ID as provided, on success, callback updated todo object
// C - error-first callback
// E - no item with ID

// High Level
// same as create, instead of getting a unique ID, we have an ID provided

exports.update = (id, text, callback) => {

  var filePath = path.join(exports.dataDir, `${id}.txt`);

  exports.readOne(id, (err, file) => {
    if (!file) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.writeFile(filePath, text, (err) => {
        if (err) {
          throw 'cannot write todo file';
        } else {
          callback(null, {text: text, id: id});
        }
      });
    }
  });
};
/*

I - ID, (convert to filepath) and callback function
O - No return, should functionally delete file
C - Error First Call-back pattern
E - File does not exist

~~High Level Strategy~~
  Create filepath, Check if file exists, if it exists, delete with FS method.
fs.rm(filepath);
*/
exports.delete = (id, callback) => {

  var filePath = path.join(exports.dataDir, `${id}.txt`);

  exports.readOne(id, (err, file) => {
    if (!file) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      fs.rm(filePath, (err) => {
        callback(err);
      });
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
