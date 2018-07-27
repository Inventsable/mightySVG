const regMighty = {
  color : {
    hex : /#([a-fA-F0-9]){6}|([a-fA-F0-9]){3}/,
    rgb: /rgb(\(.*\))/,
    rgba: /rgba(\(.*\))/,
    hsl: /hsl(\(.*\))/,
  }
}

const regSVG = {
  block : /<.*>/,
  objects: /<.*>/,
  parentTag : /<[a-zA-Z]*/,
  parentAttrList : /\w([a-zA-Z])*=/,
  idAttr : /id=("|'|`)([^("|'|`)]*)("|'|`)/,
  classAttr : /class=("|'|`)([^("|'|`)]*)("|'|`)/,
  // look behinds don't work
  // classList: /((?<=(?<=\s)\.)(\D\S[^\'\s]*))|((?<=class=\")([^("|'|`)]*)(?=\"))/,
  isClass : /\.(\D\S[^\'\s]*)/g,
  isId : /\#(\S[^\'\s]*)/g,
  svg : {
    id : /id=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    xmlns : /xmlns=("|'|`)([^("|'|`)]*)(?="|'|`)/,
  },
  title : /title=("|'|`)([^("|'|`)]*)(?=("|'|`))/,
  rect : {
    x : /x=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    y : /y=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    width : /width=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    height : /height=("|'|`)([^("|'|`)]*)(?="|'|`)/,
  },
  polygon : {
    points : /points=("|'|`)([^("|'|`)]*)(?="|'|`)/,
  },
  circle : {
    cx : /cx=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    cy : /cy=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    r : /r=("|'|`)([^("|'|`)]*)(?="|'|`)/,
  },
  path : {
    d : /cy=("|'|`)([^("|'|`)]*)(?="|'|`)/,
    transform : /transform=("|'|`)([^("|'|`)]*)(?="|'|`)/,
  },
};

const regCSS = {
  prop : /[^\s].*(?=\s\{)/g,
  key : /[^\s].*(?=:)/g,
  value : /:.*(?=;)/g,
}

var fakeCSS = `body {
  margin: 0px 5%;
  overflow: hidden;
  background-color: var(--colorPanelBG);
  color: var(--colorIcon);
}

.someClass {
  color: red;
}

#someId {
  color: green;
}`;

var fakeSVG = `<rect id='hello .class .newClass-user-style .fa-icon' class="cls-1" x="0.5" y="0.5" width="4.13" height="4.13"/>`;
// var thisClass = getSVGAttributeValue(fakeSVG, 'class');
// var thisWidth = getSVGAttributeValue(fakeSVG, 'width');
// var thisHeight = getSVGAttributeValue(fakeSVG, 'height');
// console.log(`class: ${thisClass}
// width: ${thisWidth}
// height: ${thisHeight}`);

function getSVGAttributeValue(str, arg) {
  var value = false;
  var suffix = `=("|'|\`)([^("|'|\`)]*)(?="|'|\`)`;
  var reg = new RegExp(arg + suffix, "g");
  if (reg.test(str))
    value = strReplace(str.match(reg).toString(), arg + `="`);
  return value;
}

function getCSSLineByKey(str, arg){
  var value = false;
  var regEx = arg + `.*(?=;)`;
  var reg = new RegExp(regEx, "g");
  if (reg.test(str)) {
    value = str.match(reg);
  }
  console.log(value[0]);
  return value[0];
}

getCSSBySelector(fakeCSS, 'body')
getCSSBySelector(fakeCSS, '#someId')

function getCSSBySelector(str, arg) {
  var value = false;
  var regEx = arg + `\\s{([^}]*)}`;
  var reg = new RegExp(regEx, "g");
  if (reg.test(str)){
    value = str.match(reg);
    getCSSLineByKey(str, getCSSKeyBySelector(value[0]));
  }
  return value[0];
}

function getCSSValuefromLine(str){
  console.log(str);
  var contents = str.match(regCSS.value);
  // console.log(contents);
  // contents = trimL(contents[0], 2);
  // console.log(contents);
}

function getCSSKeyBySelector(str){
  var contents = str.match(regCSS.key);
  return contents[0];
}

// getValuesOfParentAttributes(testSVG)
function getValuesOfParentAttributes(str) {
  var contents = str.match(regSVG.isClass);
  console.log(contents);
}


// console.log(parseClassListFromId(`id='hello .class .fa-icon'`));
function parseClassListFromId(str){
  var classList = [];
  if (regSVG.idAttr.test(str)){
    var contents = str.match(regSVG.idAttr);
    if (regSVG.isClass.test(contents[2])){
      var innerText = contents[2].split(' ');
      for (var i = 0; i < innerText.length; i++){
        var thisClass = innerText[i].match(regSVG.isClass);
        try {
          classList.push(trimL(thisClass[0],1));
        } catch(e){continue}
      }
    }
  }
  return classList;
}
