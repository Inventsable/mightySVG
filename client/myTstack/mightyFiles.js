var csInterface = new CSInterface();
var sysPath = csInterface.getSystemPath(SystemPath.EXTENSION);
var logPath = sysPath + "/log/";

// create function for RegEx or replace of id=".[]", inject as class
// rewrite PlayWrite as object to bundle functions.

// To see adobe i/o functions:
console.log(window.cep.fs);


function clearTests() {
  fileArray = ['test1.js', 'test2.js', 'test3.js', 'test4.js', 'test5.js', '']
  deleteFiles('./log', fileArray)
  deleteFile('./log', 'test7.json')
}

function howToWriteFile(){
  var variablePath = logPath + 'test3.js';
  var variableContent = `I don't specify an extension and automatically become JSON`;
  writeFile('./log', 'test1.js', `I can do locally from the extension's main folder`);
  writeFile('./log/test2.js', 'I can detect if folder is beyond the scope of local and allow global');
  writeFile(variablePath, `I'm using a full path from a variable`);
  writeFile(logPath, 'test4.js', `I have (directory, name, content) parameters`);
  writeFile(logPath + 'test5.js', 'Or (fullPath, content) parameters');
  writeFile(logPath + 'test6', variableContent);
  writeFile(logPath, 'test7', 'I have 3 parameters and no file extension');
}


// duplicateFile('./log', 'test1.js', 'test4.js')
function duplicateFile(path, original, newName){
  var directory = sysPath + path + '/';
  var result = writeFile(directory, newName, readFile(directory, original));
  return result;
}
// console.log(copyFile('./log', 'test6.json', makeDir('./log/temp'), 'New.json'));

// copyFile('./log', 'test1.js', './log/temp', 'test4.js')
function copyFile(path1, original, path2, newName){
  console.log(direct1 + " " + direct2);
  var result = writeFile(direct2, readFile(direct1, original));
  return result;
}


// readFiles('./log', 'test1.js', 'test2.js', 'test3.js')
// returns array of contents: ['Hello!', 'Goodbye!', 'Nice of you to join us in test3']
function readFiles(path, ...args){
  var mirror = [];
  var directory = sysPath + path + '/';
  for (var i = 0; i < args.length; i++) {
    mirror.push(readFile(directory, args[i]));
  }
  return mirror;
}

// writeFiles('./log', ['main.js', 'style.css'], [JScontent, CSScontent])
function writeFiles(path, paths=[], contents=[]){
  var directory = sysPath + path + '/';
  var errors = [];
  paths.forEach(function(v,i,a){
    var rewrite = writeFile(directory, v, contents[i]);
    if (!rewrite)
      errors.push(i);
  });
  if (!errors)
    return true;
  else
    return false;
}


// console.log(makeDir('./log/test'));
function makeDir(path) {
  path = (isLocalFile(path) ? sysPath + path : path);
  var result = window.cep.fs.makedir(path);
  if (0 == result.err)
    return result.data;
  else
    return false;
}

deleteDir('./log/temp')


function deleteDir(path) {
  path = (isLocalFile(path) ? sysPath + path : path);
  console.log(path);
  csInterface.evalScript(`deleteFolder(${path})`, function(e){
    console.log(e);
  })
}



function localPath(path){
  path = (isLocalFile(path) ? sysPath + path : path);
  return path;
}


// var thisDir = readDir('./log');
// console.log(readDir('./log'));
// console.log(readDir(logPath))
// console.log(thisDir[0]);
// console.log(readDir('./log'));

function readDir(path) {
  path = (isLocalFile(path) ? sysPath + path : path);
  var lastChar = path.substring(path.length - 1, path.length);
  if (lastChar  == '/') {
    path = path.substring(0, path.length - 1);
  }
  var result = window.cep.fs.readdir(path);
  if (0 == result.err)
    return result.data;
  else
    return false;
}


// console.log(readAllFiles('./log'));
function readAllFiles(path){
    path = (isLocalFile(path) ? sysPath + path : path);
    var collection = [];
    var children = readDir(path);
    children.forEach(function(v,i,a){
      collection.push(readFile(path + '/' + v));
    })
    return collection;
}


function deleteFile(path, name){
  var directory = sysPath + path + '/';
  var result = window.cep.fs.deleteFile(directory + name);
  return result;
}

function deleteFiles(path, names){
  var directory = sysPath + path + '/';
  var errors = [];
  names.forEach(function(v,i,a){
    var result = window.cep.fs.deleteFile(directory + v);
    if (!result)
      errors.push(i);
  });
  console.log(errors);
  if (!errors)
    return true;
  else
    return false;
}


function checkEnding(str){
  str = str.substring(str.lastIndexOf('/') + 1, str.length);
}

function extFolder(){
  var str = csInterface.getSystemPath(SystemPath.EXTENSION);
  var parent = str.substring(str.lastIndexOf('/') + 1, str.length);
  return parent;
}

function isLocalFile(file){
  var str = csInterface.getSystemPath(SystemPath.EXTENSION);
  var parent = str.substring(str.lastIndexOf('/') + 1, str.length);
  if (!inString(file, parent)) {
    return parent;
  } else {
    return false;
  }
}


function hasFileExtension(str){
  var errs = [];
  var ext = ['.js', '.jsx', '.html', '.css', '.json', '.txt', '.md'];
  for (var i = 0; i < ext.length; i++){
    if (inString(str, ext[i])) {
      errs.push(ext[i]);
    }
  }
  if (errs.length > 0) {
    return true;
  } else {
    return false;
  }
}

// console.log(readFile('./log/test1.js'));
// console.log(readFile(logPath, 'test2.js'));
// console.log(readFile('./log', 'test3.js'));

//               (path, name)
//               (path)
function readFile(args){
  var directory = (isLocalFile(arguments[0]) ? sysPath + arguments[0] : arguments[0]);
  // var directory = sysPath + path + '/';
  console.log(directory);
  if (arguments.length > 1) {
    result = window.cep.fs.readFile(arguments[0] + arguments[1]);
  } else {
    result = window.cep.fs.readFile(arguments[0]);
  }
  if (0 == result.err) {
    return result.data;
  }
}


//                (path, name, data)
//                (path, data)
function writeFile(args) {
  var directory;
  if (inString(arguments[0], 'Adobe/CEP/extensions')){
    directory = arguments[0];
  } else {
    console.log(arguments[0]);
    if (hasFileExtension(arguments[0])) {
      directory = sysPath + arguments[0];
    } else {
      directory = sysPath + arguments[0] + '/';
    }
    console.log('local directory is: ' + directory);
  }
  // console.log(directory);
  var result;
  if (arguments.length > 2) {
    res = directory + arguments[1];
    res = (hasFileExtension(res) ? res : res += '.json');
    result = window.cep.fs.writeFile(res, arguments[2]);
  } else if (arguments.length > 1) {
    directory = (hasFileExtension(directory) ? directory : directory += '.json');
    result = window.cep.fs.writeFile(directory, arguments[1])
  } else {
    console.log("Need more parameters for writeFile(name, data)");
    return false;
  }
  if (0 == result.err) {
    return true;
  } else {
    return false;
  }
}
