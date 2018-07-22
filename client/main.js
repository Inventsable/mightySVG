var csInterface = new CSInterface();
var appSkin = csInterface.hostEnvironment.appSkinInfo;
var sysPath = csInterface.getSystemPath(SystemPath.EXTENSION);
var logPath = sysPath + "/log/";
var previewPath = sysPath + "/preview";
var hostPath = sysPath + "/host/";
var appName = csInterface.hostEnvironment.appName;

loadUniversalJSXLibraries();
loadJSX(`${appName}.jsx`);
loadJSX(`mightySVG.jsx`);
console.log(`Loading for ${appName}`);
console.log(appUI);

csInterface.evalScript(`setDirectory('${previewPath}')`)
var preview = document.getElementById('preview');

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


var coords = {
  artB : {
    x1:null,
    y1:null,
    x2:null,
    y2:null,
    w:null,
    h:null,
    index:null,
  }
}

var scanAB;
scanningArtboard(true);

function scanningArtboard(state) {
  var res, here;
  var parm = ["x1", "y1", "x2", "y2", "w", "h", "index"];
  if (state) {
		timerAB = setInterval(function(){csInterface.evalScript('scanCurrentArtboard();', function(a){
      if (a == scanAB) return;
      if (a !== scanAB) {
        console.log('Artboard changed');
        csInterface.evalScript(`updateArtboardDimensions(${a});`, function(aa){
          var res = aa.split(',');
          for (var m = 0; m < res.length; m++) {
            here = parm[m];
            coords.artB[here] = parseInt(res[m]);
          };
          console.log(coords.artB);
        });
        setPreviewBounds(coords.artB.w, coords.artB.h);
      }
      scanAB = a;
    })}, 50);
    console.log("Scanning artboard on");
	} else {
		clearInterval(timerAB);
		console.log("Scanning artboard off");
	}
}


var shortSVG, styleSheet;

var btnExport = document.getElementById('push');
btnExport.addEventListener('click', function(e){
  var name = appUI.data.doc;
  name = name.split(".")
  name = name[0]
  csInterface.evalScript(`exportDocument('${name}')`, function(e){
    var thisFile = previewPath + "/" + name + ".svg";
    sleep(1000);
    var result = window.cep.fs.readFile(thisFile);
    if (0 == result.err) {
      newPreview(result.data, name);
      updatePreview(name);
    } else {
      console.log(`Error ${result.err}`);
    }
  })
}, false)



function newPreview(svg, name){
  var prefix = svg.split("<style>")
  var styleSheet = prefix[1].split("</style>");
  styleSheet = styleSheet[0].substr(2, styleSheet[0].length);
  var suffix = svg.split("</style>");
  prefix = prefix[0];
  suffix = suffix[1];
  prefix = prefix.replace("<defs>", '')
  suffix = suffix.replace("</defs>", '')
  prefix = prefix.trim();
  suffix = suffix.trim();
  shortSVG = prefix + suffix;
  shortSVG = shortSVG.replace('<title>', '\r<title>')
  console.log(shortSVG);
  writeNewStyleSheet(styleSheet, name)
}

function writeNewStyleSheet(sheet, name) {
  var thisFile = previewPath + "/tempStyle.css";
  // var result = window.cep.fs.readFile(thisFile);
  var result = window.cep.fs.writeFile(thisFile, sheet);
  if (0 == result.err) {
    console.log(`Successful`);
  } else {
    console.log(`Error ${result.err}`);
  }
}

function clearPreview(){
  while(preview.firstChild){
      preview.removeChild(preview.firstChild);
  }
}

function updatePreview(file){
  clearPreview();
  // https://stackoverflow.com/a/14070928
  xhr = new XMLHttpRequest();
  xhr.open("GET","../preview/" + file + ".svg",false);
  xhr.overrideMimeType("image/svg+xml");
  xhr.send("");
  // console.log(xhr.responseXML.documentElement);
  // target
  document.getElementById('preview')
  .appendChild(xhr.responseXML.documentElement);
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
