var csInterface = new CSInterface();
var appSkin = csInterface.hostEnvironment.appSkinInfo;
var sysPath = csInterface.getSystemPath(SystemPath.EXTENSION);
var logPath = sysPath + "/log/";
var hostPath = sysPath + "/host/";
var previewPath = sysPath + "/preview/";
var appName = csInterface.hostEnvironment.appName;
var playDOM = '../../Playwrite/log/Sandbox/1.jsx';
var newName;

loadUniversalJSXLibraries();
loadJSX(`${appName}.jsx`);
loadJSX(`mightySVG.jsx`);
console.log(`Loading for ${appName}`);
console.log(appUI);

function changeCSSVar(prop, data){
  document.documentElement.style.setProperty('--' + prop, data);
}

var preview = document.getElementById('preview');
var autoInputs = document.getElementById('autoInputs');
var svgBtn = document.getElementById('SVG');
var cssBtn = document.getElementById('CSS');
var checkboxVariable = document.getElementById('convertVariables');
var playBtn = document.getElementById('playDOM');

var mighty = {
  name: 'none',
  toggle : {
    SVG: false,
    display: 'SVG',
  },
  SVG: 'start',
  CSS: 'start',
  options : {
    convertVariables: false,
  },
  snatch : function() {
    playWrite();
  },
  AB : {
    rect: {
      x1:null,
      y1:null,
      x2:null,
      y2:null,
      w:null,
      h:null,
      index:null,
    },
    scanning: true,
    data: 'none',
    name: 'none',
  },
  classList : {
    toggles: ["base"],
    length: 0,
    1: 'none',
    2: 'none',
    3: 'none',
    4: 'none',
    5: 'none',
    6: 'none',
  },
  preview : {
    w: null,
    h: null,
    ratio: 1,
  },
  previewPath: sysPath + "/preview",
  stylePath: sysPath + "/preview/tempStyle.css",
  SVGPath: 'none',
  load : function() {
    // alert(docName());
    readLastPreview();
  },
  reload : function() {
    location.reload();
  },
};

mighty.load();

function readLastPreview(){
  // docName();
  // mighty.toggle.display = "SVG";
  var result = window.cep.fs.readFile(mighty.previewPath + "/" + appUI.data.name);
  if (0 == result.err) {
    newPreview(result.data, name);
  } else {
    console.log(`Error ${result.err}`);
  }
}

csInterface.evalScript(`setDirectory('${mighty.previewPath}')`)

function playWrite(){
  try {
    var result = window.cep.fs.readFile(sysPath + '/../../Playwrite/host/scribe.jsx');
    if (0 == result.err) {
      if (mighty.toggle.display == 'CSS') {
        var playwriteCSS = window.cep.fs.writeFile(mighty.stylePath, result.data);
        if (0 == playwriteCSS.err) {
          console.log(result.data);
        } else {
          console.log("Something went wrong for " + mighty.toggle.display);
        }
      } else if (mighty.toggle.display == 'SVG') {
        var playwriteSVG = window.cep.fs.writeFile(mighty.previewPath + "/" + mighty.name + ".svg", result.data);
        if (0 == playwriteCSS.err) {
          console.log(result.data);
        } else {
          console.log("Something went wrong for " + mighty.toggle.display);
        }
      }
      console.log(result.data);
    } else {
      console.log(`Error ${result.err}`);
    }
  } catch(e){console.log("Disconnected from PlayWrite");}
}

scanningArtboard(true);
function scanningArtboard(state) {
  var res, here;
  var parm = ["x1", "y1", "x2", "y2", "w", "h", "index"];
  if (state) {
		timerAB = setInterval(function(){csInterface.evalScript('scanCurrentArtboard();', function(a){
      if (a == mighty.AB.data) return;
      if (a !== mighty.AB.data) {
        csInterface.evalScript('artboardName()', function(n){
          mighty.AB.name = n;
          console.log('Artboard changed to ' + mighty.AB.name);
        })
        csInterface.evalScript(`updateArtboardDimensions(${a});`, function(aa){
          var res = aa.split(',');
          for (var m = 0; m < res.length; m++) {
            here = parm[m];
            mighty.AB.rect[here] = parseInt(res[m]);
          };
          console.log(mighty.AB);
        });
        setPreviewBounds(mighty.AB.rect.w, mighty.AB.h);
      }
      mighty.AB.data = a;
    })}, 50);
    console.log("Scanning artboard on");
	} else {
		clearInterval(timerAB);
		console.log("Scanning artboard off");
	}
}


function setPreviewBounds(w, h) {
  var ratio = w/h;
  // console.log(appUI.data.panelWidth + "," + ratio);
  var width = (appUI.data.panelWidth * .50);
  // var width = w;
  var height = (width / ratio);
  document.documentElement.style.setProperty('--prevWidth', width + "px");
  document.documentElement.style.setProperty('--prevHeight', height + "px");
  console.log("w:" + width + ", h:" + height);
}



function docName(){
  csInterface.evalScript(`getName()`, function(name){
    console.log(name);
    newName = name.split(".");
    mighty.name = newName[0];
    newName = newName[0];
    return mighty.name;
  })
}

var btnExport = document.getElementById('push');
btnExport.addEventListener('click', function(e){
  if (!mighty.toggle.SVG) {
    mighty.toggle.SVG = !mighty.toggle.SVG;
    showAltControls(mighty.toggle.SVG);
  }
  console.log(mighty.toggle.SVG);
  csInterface.evalScript(`getName()`, function(m){
    console.log(m);
    newName = m.split(".");
    name = newName[0];
    // newName = newName[0];
    console.log("this is " + name);
    csInterface.evalScript(`exportDocument('${name}')`, function(e){
  })
    // var thisFile = mighty.previewPath + "/" + name + ".svg";
    // sleep(1000);
    // var result = window.cep.fs.readFile(thisFile);
    // if (0 == result.err) {
    //   newPreview(result.data, name);
    // } else {
    //   console.log(`Error ${result.err}`);
    // }
  })
}, false)

function showAltControls(state){
  if (state){
    changeCSSVar('altOpacity', 1);
  } else {
    changeCSSVar('altOpacity', 1);
  }
}

function newPreview(svg, name){
  var prefix = svg.split("<style>")
  mighty.CSS = prefix[1].split("</style>");
  mighty.CSS = mighty.CSS[0].substr(2, mighty.CSS[0].length);
  var suffix = svg.split("</style>");
  prefix = prefix[0];
  suffix = suffix[1];
  prefix = prefix.replace("<defs>", '')
  suffix = suffix.replace("</defs>", '')
  prefix = prefix.trim();
  suffix = suffix.trim();
  mighty.SVG = prefix + suffix;
  mighty.SVG = mighty.SVG.replace('<title>', '\r<title>')
  // console.log(mighty.SVG);
  dispatchEvent('com.playwrite.rewrite', mighty.SVG)
  dispatchEvent('com.playwrite.console', 'Generating SVG...')
  writeNewStyleSheet(mighty.CSS, name);
}

function writeNewStyleSheet(sheet, name) {
  var thisFile = mighty.previewPath + "/tempStyle.css";
  mighty.stylePath = thisFile;
  mighty.name = name;
  // var result = window.cep.fs.readFile(thisFile);
  var result = window.cep.fs.writeFile(thisFile, sheet);
  if (0 == result.err) {
    console.log(`Generating standalone mighty.CSS`);
    countClassesFromStyleSheet(thisFile);
  } else {
    console.log(`Error ${result.err}`);
  }
}

function clearPreview(){
  while(preview.firstChild){
      preview.removeChild(preview.firstChild);
  }
}

function countClassesFromStyleSheet(file){
  mighty.CSS = file;
  var result = window.cep.fs.readFile(file);
  if (0 == result.err) {
    countClasses(result.data, result.err);
    buildInputsForClasses(mighty.classList.length);
    readStyle();
    readSVG();
    replaceAllClasses();
  } else {
    console.log(`Error ${result.err}`);
  }
}

function countClasses(sheet, num){
  ++num;
  try {
    if (~sheet.indexOf('cls-' + num))
      countClasses(sheet, num);
    else
      return finalCount(num);
  } catch(e){
    console.log(e);
  }
}

function finalCount(num){
  mighty.classList.length = (num - 1);
}


function buildInputsForClasses(num){
  mighty.classList.toggles = ['base'];
  clearLastInputs();
  mighty.toggle.display = 'SVG';
  // setSwitch('SVG', 'CSS', true);
  for (var i = 1; i <= num; i++) {
    var parent = document.createElement('div');
    var inputGroup = parent.appendChild(document.createElement('div'));
    var checkGroup = parent.appendChild(document.createElement('div'));
    var inputPrefix = inputGroup.appendChild(document.createElement('span'));
    var input = inputGroup.appendChild(document.createElement('input'));
    var checkLayer = checkGroup.appendChild(document.createElement('span'));
    var checkToggle = checkGroup.appendChild(document.createElement('div'));
    var thisClass = 'cls-' + i;
    mighty.classList.toggles.push(true);
    mighty.classList[i] = thisClass;
    parent.classList.add('adobe-Group');
    inputGroup.classList.add('adobe-inputGroup');
    checkGroup.classList.add('adobe-checkGroup');
    inputPrefix.classList.add('adobe-input-prefix');
    inputPrefix.textContent = i;
    input.classList.add('adobe-input');
    input.classList.add('adobe-input-lg');
    input.id = thisClass;
    input.type = 'text';
    input.name = thisClass;
    input.setAttribute('value', thisClass);
    checkLayer.classList.add('adobe-icon-layerRadioOn');
    checkLayer.id = 'layerRadio' + i;
    checkToggle.classList.add('adobe-checkToggle');
    autoInputs.appendChild(parent);
    input.addEventListener('keydown', function(e){
      if (e.key === 'Enter') {
        console.log('submitting ' + input.value);
        replaceClass(e.target.id);
        replaceAllClasses();
      } else if ((e.key === 'Backspace') || (e.key === 'Delete')) {
        if ((e.shiftKey) || (e.ctrlKey)) {
          e.target.value = '';
        }
      }
    }, false)
    checkLayer.addEventListener('click', function(e){
      var thisState = mighty.classList.toggles[i];
      thisState = !thisState;
      mighty.classList.toggles[i] = thisState;
      toggleLayer(mighty.classList.toggles[i], checkLayer);
    }, false)
  }
  if (num > 1) {
    console.log(`${num} classes detected.`);
  } else {
    console.log(`${num} class detected.`);
  }
}

checkboxVariable.addEventListener('click', function(e){
  var thisState = mighty.options.convertVariables;
  thisState = !thisState;
  mighty.options.convertVariables = thisState;
  toggleCheckbox(mighty.options.convertVariables, checkboxVariable.children[0]);
}, false)


function toggleLayer(state, target){
    target.classList.remove('adobe-icon-layerRadioOn', 'adobe-icon-layerRadioOff');
    if (state) {
      target.classList.add('adobe-icon-layerRadioOn');
    } else {
      target.classList.add('adobe-icon-layerRadioOff');
    }
}

function toggleCheckbox(state, target){
  target.classList.remove('adobe-icon-checkBoxOn', 'adobe-icon-checkBoxOff');
  if (state) {
    target.classList.add('adobe-icon-checkBoxOn');
  } else {
    target.classList.add('adobe-icon-checkBoxOff');
  }
}

function dispatchEvent(name, data) {
  var event = new CSEvent(name, 'APPLICATION');
  event.data = data;
  csInterface.dispatchEvent(event);
}


function readStyle(){
  var result = window.cep.fs.readFile(mighty.stylePath)
  if (0 == result.err) {
    mighty.CSSprev = result.data;
  }
}

function readSVG(){
  mighty.SVGPath = mighty.previewPath + "/" + mighty.name + ".svg";
  console.log(mighty.SVGPath);
  var result = window.cep.fs.readFile(mighty.SVGPath)
  if (0 == result.err) {
    mighty.SVGprev = result.data;
  }
}

function replaceClass(hit){
  var result = window.cep.fs.readFile(mighty.stylePath);
  if (0 == result.err) {
      var number = hit.slice(-1);
      var target = document.getElementById(hit);
      var file = result.data;
      mighty.CSSprev = replaceAll(file, target.name, target.value);
      mighty.SVGprev = replaceAll(mighty.SVG, target.name, target.value);
      target.name = target.value;
      mighty.classList[number] = target.value;
      var rewriteCSS = window.cep.fs.writeFile(mighty.stylePath, mighty.CSSprev);
      if (0 == rewriteCSS.err) {
        var rewriteSVG = window.cep.fs.writeFile(mighty.previewPath + "/" + mighty.name + ".svg", mighty.SVGprev);
        if (0 == rewriteSVG.err) {
          displayToPlayWrite(mighty.toggle.display);
        } else {
          console.log(`Error rewriting SVG: ${rewriteSVG.err}`);
        }
      } else {
        console.log(`Error rewriting CSS: ${rewriteCSS.err}`);
      }
  } else {
    console.log(`Error reading file: ${result.err}`);
  }
  console.log(mighty.classList);
}

function replaceAll(s, f, r){
   return s.split(f).join(r);
 }

 function replaceAllClasses(){
   var lastCSS = window.cep.fs.readFile(mighty.stylePath);
   var lastSVG = window.cep.fs.readFile(mighty.SVGPath);
   if (0 == lastCSS.err) {
     for (var i = 1; i <= mighty.classList.length; i++) {
       try {
         mighty.CSS = replaceAll(lastCSS.data, 'cls-' + i, mighty.classList[i])
         mighty.SVG = replaceAll(mighty.SVGprev, 'cls-' + i, mighty.classList[i])
       } catch(e) {
         console.log(e);
       }
     }
     console.log(mighty.CSS);
     console.log(mighty.SVG);
   }
   if (0 == lastSVG.err) {
     for (var i = 1; i <= mighty.classList.length; i++) {
       try {
         console.log(mighty.classList[i]);
       } catch(e) {
         console.log("SVG failed: " + e);
       }
     }
   } else {
     console.log("SVG isn't loading");
   }
 }

// function setSwitch(which, other, to){
//   var target = document.getElementById(which);
//   var sibling = document.getElementById(other);
//   target.classList.remove('adobe-btn-switch-on', 'adobe-btn-switch-off');
//   sibling.classList.remove('adobe-btn-switch-on', 'adobe-btn-switch-off');
//   if (to) {
//     target.classList.add('adobe-btn-switch-on');
//     sibling.classList.add('adobe-btn-switch-off');
//   } else {
//     target.classList.add('adobe-btn-switch-off');
//     sibling.classList.add('adobe-btn-switch-on');
//   }
// }

function displayToPlayWrite(display){
  if (display == 'CSS') {
    dispatchEvent('com.playwrite.rewrite', mighty.CSSprev)
    dispatchEvent('com.playwrite.console', 'Rewriting mighty.CSS...')
  } else if (display == 'SVG') {
    dispatchEvent('com.playwrite.rewrite', mighty.SVGprev)
    dispatchEvent('com.playwrite.console', 'Rewriting SVG...')
  }
}

svgBtn.addEventListener('click', function(e){
  if (mighty.toggle.SVG) {
    mighty.toggle.display = 'SVG';
    displayToPlayWrite(mighty.toggle.display);
  }
}, false)

cssBtn.addEventListener('click', function(e){
  if (mighty.toggle.SVG) {
    mighty.toggle.display = 'CSS';
    displayToPlayWrite(mighty.toggle.display);
  }
}, false)

playBtn.addEventListener('click', function(e){
  if (mighty.toggle.SVG) {
    playWrite();
    console.log("Writing from PlayWrite");
  }
})


function clearLastInputs(){
  while(autoInputs.firstChild){
      autoInputs.removeChild(autoInputs.firstChild);
  }
}

function updatePreview(file){
  clearPreview();
  // https://stackoverflow.com/a/14070928
  xhr = new XMLHttpRequest();
  xhr.open("GET","../preview/" + file + ".svg",false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");
  document.getElementById('preview')
  .appendChild(xhr.responseXML.documentElement);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
