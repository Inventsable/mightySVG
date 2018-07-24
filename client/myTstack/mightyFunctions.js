var csInterface = new CSInterface();


//               (path, name)
//               (path)
function readFile(args){
  if (arguments.length > 1) {
    result = window.cep.fs.readFile(arguments[0], arguments[1])
  } else {
    result = window.cep.fs.readFile(arguments[0])
  }
  if (0 == result.err) {
    return result.data;
  }
}

//                (path, name, data)
//                (path, data)
function writeFile(args) {
  var result;
  if (arguments.length > 2) {
    result = window.cep.fs.writeFile(arguments[0] + "/" + arguments[1], arguments[2]);
  } else if (arguments.length > 1) {
    result = window.cep.fs.writeFile(arguments[0], arguments[1])
  } else {
    console.log("Need more parameters for writeFile(name, data)");
    return
  }
  if (0 == result.err) {
    return result.data;
  }
}

function copyFile(args){
  try {
    writeFile(arguments[0], readFile(arguments[1]));
  } catch(e){return false}
  return true;
}

function trimL(str, num) {
  return str.substr(num)
}

function trimR(str, num) {
  return str.slice(0, (num * -1));
}

function trimEdges(str, num) {
  return str.substr(num).slice(0, (num * -1));
}

function strReplace(s, f, r){
   return s.split(f).join(r);
 }

function inString(haystack, needle){
  if (haystack.includes(needle)) {
    return true;
  } else {
    return false;
  }
}

function isBetween(a, b, c) {
  if ((a > b) && (a < c)) {
    return true;
  } else {
    return false;
  }
}

// 1 param: automatic div tag, param is either id or classes (no solo class)
// createChild(preview, ['adobe adobe-btn']);

// 3 params: tag, id/classes, class
// createChild(preview, ['div', 'hello', 'fa fa-lg fa-magic']);
function createChild(parent, child) {
  var id = false;
  var classes = false;
  var tag = false;
  if (child.length < 2) {
    tag = 'div';
  } else {
    tag = child[0];
  }
  var container = parent.appendChild(document.createElement(tag))
  if (child.length > 1) {
    if (theseAreClasses(child[1])) {
      classes = child[1];
    } else {
      id = child[1];
    }
  }
  if (child.length > 3) {
    if (tag == 'input') {
      container.type = "text";
      container.name = id;
      container.value = child[3];
    } else if (tag == 'span') {
      container.textContent = child[3];
    }
    classes = child[2];
  } else if (child.length > 2) {
    id = child[1];
    classes = child[2];
  } else if (child.length > 1) {
    // console.log('Two params');
  } else if (child.length > 0) {
    if (theseAreClasses(child[0])) {
      classes = child[0];
    } else {
      id = child[0];
    }
  }
  if (classes) {
    container.setAttribute("class", classes);
  }
  if (id) {
    container.id = id;
  }
}

function theseAreClasses(target){
  if (inString(target, ' ')) {
    return true;
  } else {
    return false;
  }
}

function dispatchEvent(name, data) {
  var event = new CSEvent(name, 'APPLICATION');
  event.data = data;
  csInterface.dispatchEvent(event);
}

function chainEvent(data, name) {
  csInterface.evalScript(`JSXEvent('${data}', '${name}')`)
}

function changeCSSVar(prop, data){
  document.documentElement.style.setProperty('--' + prop, data);
}

function deleteChildren(parent){
  while(parent.firstChild){
      parent.removeChild(parent.firstChild);
  }
}

function loadJavaScript(filename){
    var fileref=document.createElement('script')
    fileref.setAttribute("type","text/javascript")
    fileref.setAttribute("src", "../log/" + filename + ".js")
    if (typeof fileref!="undefined")
        document.getElementsByTagName("head")[0].appendChild(fileref)
}
