var doc = app.documents[0];
var directory;
var setPath;
var setName;

var thisDoc = app.documents[0];
var activeAB = thisDoc.artboards.getActiveArtboardIndex();
var lastAB = 0;
var lastABOffset, isOrigin, thisAB, absAB, relAB;

function getName(){
  return app.documents[0].name;
}

function setDirectory(path){
  setPath = path;
  var setFolder = new Folder(path);
  setFolder.create();
}


// deleteFolder('C:/Users/PortablePawnShop/AppData/Roaming/Adobe/CEP/extensions/mightySVG./log/temp')



function deleteFolder(path) {
  var thisFolder = Folder(path);
  try {
    thisFolder.remove();
    return true;
  } catch(e){return false;}
}

function verifyFile(name){
  var newFile = File(setPath + "/" + name + ".svg");
  try {newFile.open('r');
    } catch(e){alert(e)};
  var contents = newFile.read();
  return contents;
}

function clearSet(){
  var setFolder = Folder(setPath);
  var setFile = setFolder.getFiles("*.svg");
  if ( !setFile.length ) {
    // alert("No files");
    return;
  } else {
    for (var i = 0; i < setFile.length; i++) {
      setFile[i].remove();
    }
  }
}

function setOptionsForSVGExport(){
  var options = new ExportOptionsWebOptimizedSVG();
  options.artboardRange = '1';
  options.coordinatePrecision = 2;
  options.fontType = SVGFontType.OUTLINEFONT;
  options.svgId = SVGIdType.SVGIDREGULAR;
  options.cssProperties = SVGCSSPropertyLocation.STYLEELEMENTS;
  return options;
}

function exportSVG(name){
  var newName = setPath + "/" + name + ".svg";
  var thisFile = new File(newName);
  var type = ExportType.WOSVG;
  doc.exportFile(thisFile, type, setOptionsForSVGExport());
  // JSXEvent(verifyFile(name), "console");
  // console.log(verifyFile(name));
  JSXEvent(name, "com.mightySVG.result");
}



function exportDocument(name){
  exportSVG(name);
}

function dupeAndHideOriginal(){
  app.executeMenuCommand('selectall');
  app.executeMenuCommand('copy');
  app.executeMenuCommand('pasteFront');
  app.executeMenuCommand('Selection Hat 9');
  try {
    app.executeMenuCommand('OffsetPath v22');
  } catch(e){return}
  app.executeMenuCommand('Selection Hat 8');
  app.executeMenuCommand('hide');
}

function reshowOriginal(){
  app.executeMenuCommand('undo'); // undo hide
  app.executeMenuCommand('undo'); // undo pasteFront
}

function scanCurrentArtboard(){
  activeAB = thisDoc.artboards.getActiveArtboardIndex();
  if (activeAB !== lastAB)
    return activeAB
  else
    return lastAB;
  lastAB = activeAB;
}

function artboardName(){
  thisAB = thisDoc.artboards.getActiveArtboardIndex();
  return thisDoc.artboards[thisAB].name;
}

// alert(updateArtboardDimensions(0))

function updateArtboardDimensions(index){
  var w, h;
  thisAB = thisDoc.artboards.getActiveArtboardIndex();
  absAB = thisDoc.artboards[index].artboardRect;
  absAB[1] = (absAB[1] * (-1));
  relAB = [];
  for (var inv = 0; inv < 4; inv++) {
    res = (absAB[inv] < 0) ? (absAB[inv] * (-1)) : absAB[inv];
    relAB.push(roundTo(res, 4));
  }
  if (absAB[0] < 0)
    w = (absAB[0] - relAB[2]);
  else
    w = (relAB[0] - relAB[2]);
  if (absAB[1] < 0)
    h = (absAB[1] - absAB[3]);
  else
    h = (relAB[1] - relAB[3]);
  w = (w < 0) ? (w*(-1)) : w;
  h = (h < 0) ? (h*(-1)) : h;
  lastABOffset = [ parseInt((absAB[0] * -1)), parseInt(absAB[1]), thisAB ]
  absAB[1] = (absAB[1] * (-1));
  return rect = [ absAB[0], absAB[1], absAB[2], absAB[3], w, h, thisAB ];
}


function roundTo(n, digits) {
    var negative = false;
    if (digits === undefined) {
        digits = 0;
    }
        if( n < 0) {
        negative = true;
      n = n * -1;
    }
    var multiplicator = Math.pow(10, digits);
    n = parseFloat((n * multiplicator).toFixed(11));
    n = (Math.round(n) / multiplicator).toFixed(2);
    if( negative ) {
        n = (n * -1).toFixed(2);
    }
    return n;
}
