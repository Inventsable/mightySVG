var csInterface = new CSInterface();
var sysPath = csInterface.getSystemPath(SystemPath.EXTENSION);
var logPath = sysPath + "/log/";

// To see adobe i/o functions:
console.log(window.cep.fs);


function clearTests() {
  fileArray = ['test1.js', 'test2.js', 'test3.js', 'test4.js', 'test5.js', 'test6.json'];
  deleteFiles('./log', fileArray);
}

function howToWriteFile(){
  var variablePath = logPath + 'test3.js';
  writeFile('.log/', 'test1.js', `I'm test 1!`);
  writeFile('./log/test2.js', `I'm test 2!`);
  writeFile(variablePath, `I'm test 3!`);
  writeFile(logPath, 'test4.js', `I have (directory, name, content) parameters`);
  writeFile(logPath + 'test5.js', 'Or (fullPath, content) parameters');
  writeFile(logPath, 'test6', `With 3 arguments I'll default to .json if name has no extension`);
}


function correctPathErrors(str) {
  str = (inString(str, '//') ? strReplace(str, '//', '/') : str );
  str = ( !hasFileExtension(str) ? ((str[str.length - 1] !== '/') ? str + '/' : str ) : str)
  str = (/^.[a-z]/.test(str.substr(0,3)) ? str.replace('.', './') : str);
  return str;
}

function smartPath(path) {
  path = correctPathErrors(path);
  return (isLocalFile(path) ? sysPath + path : path);
}


//  DIRECTORY
//
function makeDir(path) {
  path = isDirectory(smartPath(path));
  var result = window.cep.fs.makedir(path);
  if (0 == result.err)
    return result.data;
  else
    return false;
}

function readDir(path) {
  path = isDirectory(smartPath(path));
  var result = window.cep.fs.readdir(path);
  if (0 == result.err)
    return result.data;
  else
    return false;
}

function readAllFiles(path){
  path = isDirectory(smartPath(path));
    var collection = [];
    var children = readDir(path);
    children.forEach(function(v,i,a){
      collection.push(readFile(path + '/' + v));
    });
    return collection;
}

function deleteDir(path) {
  path = isDirectory(smartPath(path));
  try {
    var children = readDir(path);
    deleteFiles(path, children);
    csInterface.evalScript(`deleteFolder('${path}')`, function(e){
      return e;
    })
  } catch(e){return false;}
}

function isDirectory(path){
  var lastChar = path.substring(path.length - 1, path.length);
  if (lastChar  == '/') {
    path = trimR(path, 1);
  }
  return path;
}


//   FILES
//
//               (path, name)
//               (path)
function readFile(args){
  var result;
  let path = smartPath(arguments[0]);
  if (arguments.length > 1) {
    result = window.cep.fs.readFile(path + arguments[1]);
  } else {
    result = window.cep.fs.readFile(path);
  }
  if (0 == result.err) {
    return result.data;
  }
}

// returns array of contents, accepts file names as arguments or arrays of filenames
function readFiles(path, ...args){
  path = smartPath(path);
  var mirror = [];
  for (var i = 0; i < args.length; i++) {
    if (hasArray(args[i])) {
      var children = args[i];
      for (var e = 0; e < children.length; e++){
        mirror.push(readFile(path, children[e]));
      }
    } else {
      mirror.push(readFile(path, args[i]));
    }
  }
  return mirror;
}


//                (path, name, data)
//                (path, data)
function writeFile(args) {
  var directory = smartPath(arguments[0]);
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

// writeFiles('./log', ['main.js', 'style.css'], [JScontent, CSScontent])
function writeFiles(path, paths=[], contents=[]){
  path = smartPath(path);
  var errors = [];
  paths.forEach(function(v,i,a){
    var rewrite = writeFile(path, v, contents[i]);
    if (!rewrite)
      errors.push(i);
  });
  if (!errors)
    return true;
  else
    return false;
}

function deleteFile(path, name){
  path = smartPath(path);
  var result = window.cep.fs.deleteFile(path + name);
  return result;
}

//  array or any number of arguments for file names, local folder only
function deleteFiles(path, ...args){
  path = smartPath(path);
  var mirror = [];
  for (var i = 0; i < args.length; i++) {
    if (hasArray(args[i])) {
      var children = args[i];
      for (var e = 0; e < children.length; e++){
        mirror.push(deleteFile(path, children[e]));
      }
    } else {
      mirror.push(deleteFile(path, args[i]));
    }
  }
  return mirror;
}

// copyFile(path, name [, newName])
//            ( path  ,  name )
// copyFile('./CSXS', 'manifest.xml')

//            ( path  ,  name  ,  new name  )
// copyFile('./log', 'item.svg', 'newItem.svg')

//          (  path  ,  name  ,    new path,   new name  )
// copyFile('./log', 'item.svg', './client/css', 'cool.svg')

function copyFile(path, ...args){
  path = smartPath(path);
  var original, newName;
  if (args.length > 2) {
    original = args[0];
    newName = args[2];
    path2 = smartPath(args[1]);
  } else if (args.length > 1) {
    original = args[0];
    newName = args[1];
    path2 = path;
  } else {
    original = args[0];
    newName = insertAliasBeforeExt(original);
    path2 = path;
  }
  var result = writeFile(path2, newName, readFile(path, original));
  return result;
}

function insertAliasBeforeExt(...args){
  if (args.length > 1) {
    return args[0].insert(args[0].lastIndexOf('.'), args[1]);
  } else {
    return args[0].insert(args[0].lastIndexOf('.'), 'copy');
  }
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
    return true;
  } else {
    return false;
  }
}


function hasFileExtension(str){
  var errs = [];
  var ext = ['.js', '.jsx', '.html', '.css', '.json', '.svg', '.txt', '.md'];
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


function findBetween(str, first, second){
    var string = str.match(new RegExp(first + "(.*)" + second));
    if (string !== null) {
      return string[1];
    } else {
      return false;
    }
}

function hasArray(...args){
  var err = false;
  for (var i = 0; i < args.length; i++){
    if (args[i].constructor == Array)
      err = args[i];
  }
  return err;
}


// function parseClassesFromLayerNames(str){
// var classes = (findBetween('id=\"hello .class\" ', 'id=\"', '\"')) ? true : false;
// }

// console.log(findBetween('id=\"hello .class\" ', 'id=\"', '\"'));
// console.log(findBetween('id=\"what now\"', 'id', 'hello'));

// console.log(hasArray('said', 'the', 'mouse', ['to', 'the', 'cur']));
// console.log(readFile('./log/test1.js'));
// console.log(readFile(logPath, 'test2.js'));
// console.log(readFile('./log', 'test3.js'));

// var thisDir = readDir('./log');
// console.log(readDir('./log'));
// console.log(readDir(logPath))
// console.log(thisDir[0]);
// console.log(readDir('./log'));
// copyFile('./log', 'test1.js')
// console.log(copyFile('./log', 'item.svg', './log/test', 'newItem.svg'));
// console.log(copyFile('./log', 'test7.json'));
// console.log(copyFile('.log', 'test7.json'));
// copyFile('./log', 'test1.js', './log/temp', 'test9.js')

// readFiles('./log', 'test1.js', 'test2.js', 'test3.js')
// readFiles('./log', ['test1.js', 'test2.js', 'test3.js'])

// console.log(correctPathErrors('.//log//'));
// console.log(correctPathErrors('./data//temp'));
// console.log(correctPathErrors('.temp/'));
// console.log(correctPathErrors('.log/data.json'));

// console.log(strReplace('.said./the./mouse./to./the./cur', './', '/', 2));
// console.log(strReplace('./such./a./trial./dear./sir', './', '/', 1));
// console.log(strReplace('no no yes yes no no', 'no', 'yes'));
// console.log(strReplace('no no yes yes no no', 'no'));
// console.log(smartPath(logPath));
// console.log(smartPath('.log/test.js'));
// console.log(smartPath('.//log/'));
