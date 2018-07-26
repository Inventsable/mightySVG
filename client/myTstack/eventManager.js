(function () {
  'use strict';

  var csInterface = new CSInterface();

  csInterface.addEventListener('com.init', function(evt) {
    console.log("Initializing console");
  });

  csInterface.addEventListener('console', function(evt) {
    console.log('JSX: ' + evt.data);
  });

  csInterface.addEventListener('com.playwrite.answer', function(evt) {
    var data = trimEdges(evt.data, 1);
    if (mighty.toggle.overWrite) {
      mighty.SVGFull = injectStylesheet(evt.data)
      writeFile(mighty.SVGFullPath, mighty.SVGFull);
      if (mighty.toggle.display == "SVG") {
        writeFile(mighty.SVGPath, evt.data);
      } else if (mighty.toggle.display == "CSS") {
        writeFile(mighty.stylePath, evt.data);
      }
      rebuildPreview();
      mighty.toggle.overWrite = !mighty.toggle.overWrite;
    }
  });

  csInterface.addEventListener('com.mightySVG.svgReady', function(evt) {
    // updatePreview(evt.data);
  });

  csInterface.addEventListener('com.mightySVG.result', function(evt) {
    // writeFile(mighty.SVGFullPath, readFile(mighty.SVGPath))
    // copyFile(mighty.SVGFullPath, mighty.SVGPath);
    mighty.name = evt.data;
    csInterface.evalScript(`verifyFile('${evt.data}')`, function(a){
      newPreview(a, mighty.name);
      updatePreview(mighty.name);
    })
  });

  function dispatchEvent(name, data) {
  	var event = new CSEvent(name, 'APPLICATION');
  	event.data = data;
  	csInterface.dispatchEvent(event);
  }

  csInterface.addEventListener("com.adobe.csxs.events.flyoutMenuClicked", log);
    function log(event){
    console.log(event);
  }

}());
