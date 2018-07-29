generateSwatchColor(0,0,40,0,'testSwatch')

function generateSwatchColor(c,m,y,k,name){
  // one array for the color property names
  var params = ['cyan', 'magenta', 'yellow', 'black'];
  // another array for the input values
  var values = [c,m,y,k];

  var newSwatchColor = new CMYKColor();

  // Loop through both arrays at the same time.
  for (var i = 0; i < params.length, i++) {
    var param = params[i];
    // Assign this input value to this color property
    newSwatchColor[param] = values[i];
  }
  // Send the result to another function
  assignSwatch(newSwatchColor, name)
}

function assignSwatch(color, name)
{
  // add new swatch, assign color and name from previous function
    var docRef = app.activeDocument;
    var newSwatch = docRef.swatches.add();
    newSwatch.name = name;
    newSwatch.color = color;
}
