var preview = document.getElementById('preview');

// export the SVG on click of button
var btnExport = document.getElementById('push');
btnExport.addEventListener('click', function(e){
  var name = appUI.data.doc;
  csInterface.evalScript(`exportDocument('${name}')`, function(e){
    var thisFile = previewPath + "/" + name + ".svg";
    // sleep(1000);
    var result = window.cep.fs.readFile(thisFile);
    if (0 == result.err)
      newPreview(result.data, name);
    else
      console.log(`Error ${result.err}`);
  })
}, false)

// the event that is meant to fire when the file is ready,
// currently fires before the file is written
csInterface.addEventListener('com.mightySVG.svgReady', function(evt) {
  updatePreview(evt.data);
});

// inject the SVG into preview through AJAX
function updatePreview(file){
  clearPreview();
  // https://stackoverflow.com/a/14070928
  client = new XMLHttpRequest();
  client.open("GET","../preview/" + file + ".svg",false);
  client.overrideMimeType("image/svg+xml");
  client.send("");
  document.getElementById('preview')
  .appendChild(client.responseXML.documentElement);
}

// remove previous svg preview
function clearPreview(){
  while(preview.firstChild){
      preview.removeChild(preview.firstChild);
  }
}

// this parses the created SVG file, creating a stylesheet and SVG file with style omitted
function newPreview(data, name) {
  // ... long ...
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
