var console = {
  log : function(data) {JSXEvent(data, 'console')}
};

function verifyFile(name){
  var newFile = File(setPath + "/" + name + ".svg");
  try {newFile.open('r');
    } catch(e){alert(e)};
  var contents = newFile.read();
  return contents;
}

function exportSVG(name){
  var newName = setPath + "/" + name + ".svg";
  var thisFile = new File(newName);
  var type = ExportType.WOSVG;
  doc.exportFile(thisFile, type, setOptionsForSVGExport());
  console.log(verifyFile(name));
}
