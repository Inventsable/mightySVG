(function () {
  'use strict';

  var csInterface = new CSInterface();

  csInterface.addEventListener('com.init', function(evt) {
    console.log("Initializing console");
  });

  csInterface.addEventListener('console', function(evt) {
    console.log(evt.data);
  });

  csInterface.addEventListener('com.mightySVG.svgReady', function(evt) {
    // updatePreview(evt.data);
  });

  csInterface.addEventListener('com.mightySVG.result', function(evt) {
    var name = evt.data;
    csInterface.evalScript(`verifyFile('${evt.data}')`, function(a){
      newPreview(a, name);
      // console.log(a);
      updatePreview(name);
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
