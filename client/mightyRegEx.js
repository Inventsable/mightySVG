const regMighty = {
  color : {
    hex : /#([a-fA-F0-9]){6}|([a-fA-F0-9]){3}/,
    rgb: /rgb(\(.*\))/,
    rgba: /rgba(\(.*\))/,
    hsl: /hsl(\(.*\))/,
    findAll: /\w.*(#(?:[0-9a-fA-F]{2}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gm,
    isValid: /(#(?:[0-9a-fA-F]{2}){2,4}|(#[0-9a-fA-F]{3})|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/g,
  },
  bracketOrderSVG : /(\<|(\/))(\w|\/)*((?=\s)|\>)/gm,
}

const regCSS = {
  allSizes: /(\d|\.)*(px|rem|%)/gm,
  allVars: /--.*;/gm,
  varContent: /var\(--.*\)/,
  allSelectors: /[^\s](\.|\#|\w|\-)*(?=(\,)|(\s\{))/gm,
  prop : /[^\s].*(?=\s\{)/g,
  key : /[^\s].*(?=:)/g,
  value : /:.*(?=;)/g,
  valueParameters : /(:|\s)((\w|#|\.|%|-[^-])+|(("|')([^("|')]*)("|')))(?!\s*\{)/g,
  multiLineParam: /.*{/,
  allKeys : /\w.*(?=:)/,
}



const regSVG = {
  tagType : {
    isOpen : /(<(\w)*\s)|(\/>)|((?=)[^\w]\>)/gm,
    openStart : /<(\w)*\s/gm,
    openEnd : /\/>/gm,
    isClose : /(<(\w)*\>)|((<\/(\w)*\>))/gm,
    closeStart : /<(\w|>)*>/gm,
    closeEnd : /<\/(\w|>)*>/gm,
  },
  tags : /<[^<]*>/gm,
  objects : /<.*>/gm,
  parentFolder : /\/(?:.(?!\/))+$/,
  // parentTag : /<[a-zA-Z]*/,
  parentTag : /<(\/|)\w*(?=\s|\>)/,
  parentAttrList : /\w([a-z|A-Z])*=/gm,
  idAttr : /id=(")([^(")]*)(")/,
  classAttr : /class=(")([^(")]*)(")/,
  equalsValue : `=(")([^(")]*)(")`,
  list : /[^\s](\w|\d|(\=((")([^(")]*)(")))|\-|\.){1,}(?=\/|\s)/gm,

  isClass : /\.(\D\S[^\'\s]*)/g,
  isId : /\#(\S[^\'\s]*)/g,
  shadow : {
    meta : {
      id : 'start',
      xmlns : 'start',
      title : 'start',
    },
    rect : {
      x : 'start',
      y : 'start',
      width : 'start',
      height : 'start',
    },
    polygon : {
      points : 'start',
    },
    circle : {
      cx : 'start',
      cy : 'start',
      r : 'start',
    },
    path : {
      d : 'start',
      transform : 'start',
    },
    build : function(){
      // console.log('building regSVG formulas...');
      for (let [key, value] of Object.entries(this)) {
        if (key == 'build') {continue}
        for (let [index, data] of Object.entries(this[key])) {
          this[key][index] = regSVGFormula(index);
        }
      }
      // console.log('Result regSVG:');
      // console.log(this);
    }
  },
};
regSVG.shadow.build();


// var types = {
//   id : "#",
//   class: ".",
// };

// var code = {
//   style : {
//     margin: null,
//   },
//   SVG : {
//     rect: null,
//   },
// };

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

// <title>AdobeIcons</title>
var fakeSVG = `<svg id="checkBoxOn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.61 15.13">
<title>AdobeIcons</title>
  <rect class="cls-1" x="1.18" y="0.5" width="4.13" height="4.13"/>
  <polygon class="cls-2" points="9.54 5.61 4.34 14.63 14.75 14.63 9.54 5.61"/>
  <circle class="cls-3" cx="3.25" cy="8.62" r="2.75"/>
  <path class="cls-4" d="M16.38,5.54a3.19,3.19,0,0,0-6.38,0" transform="translate(-1.63 -1.38)"/>
</svg>`;

// var fakeSVG = `<svg id="checkBoxOn" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 15.61 15.13">
// <title>AdobeIcons</title>
//   <rect id="first" class="cls-1" x="1.18" y="0.5" width="4.13" height="4.13"/>
//   <rect class="tag" x="1.18" y="0.5" width="4.13" height="4.13"/>
//   <rect class="cls-1 cls-3 tag-user-name" x="1.18" y="0.5" width="4.13" height="4.13"/>
//   <polygon class="cls-2" points="9.54 5.61 4.34 14.63 14.75 14.63 9.54 5.61"/>
//   <circle class="cls-3" cx="3.25" cy="8.62" r="2.75"/>
//   <path class="cls-4" d="M16.38,5.54a3.19,3.19,0,0,0-6.38,0" transform="translate(-1.63 -1.38)"/>
// </svg>`;

var shadowCounter = {
  rect: 0,
  path: 0,
};

var shadowSVG = {
  build : function(str) {
    console.log('Generating shadowSVG object:');
    let self = shadowSVG;
    self['order'] = str.match(regMighty.bracketOrderSVG);
    let lines = str.match(regSVG.objects);
    let count = [];
    let total = 0;
    for (let i = 0; i < lines.length; i++){
      let tag = trimEdges(lines[i].match(regSVG.parentTag).toString(), 1);
      let err = 0;
      count.forEach(function(v,i,a){
        // console.log(v);
        if (v == tag){
          err++;
          var thisCount = shadowCounter[tag];
          shadowCounter[tag] = thisCount++;
          if (thisCount < 2) {
            console.log('Start counting the ' + tag + 's');
            count[tag] = 1;
          } else {
            console.log('Continue counting the ' + tag + 's');
            count[tag] = shadowCounter[tag];
          }
          shadowCounter[tag] = total;
          console.log('New occurrence');
          console.log(shadowCounter);
        };
      });
      if (!err){
        count.push(tag);
        // console.log(count);
      } else {
        count.forEach(function(v,i,a){
          // console.log(v);
          if (v == tag){
            err++;
            var thisCount = shadowCounter[tag];
            console.log(shadowCounter[tag]);
            // console.log(shadowCounter);
            // console.log(thisCount++);
            shadowCounter[tag] = thisCount++;
            console.log(shadowCounter[tag]);
            if (thisCount < 2) {
              console.log('Start counting the ' + tag + 's');
              count[tag] = 1;
            } else {
              console.log('Continue counting the ' + tag + 's');
              count[tag] = shadowCounter[tag];
            }
            shadowCounter[tag] = total;
            console.log('New occurrence');
            console.log(shadowCounter);
          };
        });
        console.log('duplicate Tag');
      }
      // console.log(count);


      // console.log(tag);
      if (/^\//g.test(tag)) {
        console.log('found closed bracket: ' + tag);
      } else {
        self[tag] = {};
      }
      let parent = self[tag];
      let attrList;
      try {
        attrList = lines[i].match(regSVG.parentAttrList);
        for (let e = 0; e < attrList.length; e++){
          let thisKey = strReplace(attrList[e], '=');
          let result = self.getSVGAttributeValue(lines[i], thisKey);
          parent[thisKey] = result;
          console.log(tag + " > " + thisKey + ": " + result);
        };
      } catch(e){
        let resArray = getInnerTextOfTag(lines[i]);
        // console.log(resArray);
        let thisKey = resArray[0];
        // console.log('id will be: ' + thisKey);
        let result = resArray[1];
        let type = resArray[2];
        if (type == 'Open') {
          self[thisKey] = result;
          console.log(thisKey + ": " + result);
        } else {
          // console.log("Closed bracked should be " + thisKey);
        }
      }
    }
    console.log(self);
  },
  getSVGAttributeValue : function(str, arg) {
    var value = false;
    // var suffix = `=("|')([^("|')]*)(?="|')`;
    var suffix = `=("|')(([^("|')])|(\w|\s|\-|\(|\)))*(?="|')`;
    var reg = new RegExp(arg + suffix, "gm");
    if (reg.test(str)) {
      value = strReplace(str.match(reg).toString(), arg + `="`);
    } else if (arg == 'transform') {
      value = str.match(/transform=("|')(([^("|')])|(\w|\s|\-|\(|\)))*(?="|')/gm)
      // value = value.replace(/transform=/gm, '');
      value = trimL(value.toString(), 11);
    } else {
      console.log(`Unknown parameter: ${arg}`);
    }
    return value;
  },
  reset : function(e) {
    for (let [key, value] of Object.entries(shadowSVG)) {
      if ((key === 'build')|(key === 'send')|(key === 'reset')|(key === 'getSVGAttributeValue')) continue;
      delete shadowSVG[key];
    };
    console.log(shadowSVG);
  },
  send : function() {
    let self = shadowSVG;
    var nestLevel = 0;
    var type = false;
    var renderCode = '';
    for (let [key, value] of Object.entries(shadowSVG['order'])) {
      // let properName = convertName(key, 'fix');
      // let lines = [`${properName} {\r\n`];
      // for (let [index, data] of Object.entries(shadowSVG[key])) {
      //   lines.push("\t" + index + "=\"" + data + "\"\s\r\n")
      //   // document.documentElement.style.setProperty('--' + key + index, data);
      // }
      // lines.push(`}\r\n`);
      // lines.forEach(function(v,i,a){
      //   renderCode += v;
      // })
    };
    // console.log(renderCode);
  },
};
shadowSVG.build(fakeSVG);
// shadowSVG.reset();
// shadowSVG.send();


function getInnerTextOfTag(line){
  let result, tag, innerText, mirror=[];
  if (/<(\w)*>/g.test(line)) {
    result = line.match(/<(\w)*>/, 'g');
    tag = trimEdges(result[0].toString(), 1);
    innerText = trimL(line.match(/>.*(?=\<)/, 'g').toString(), 1);
    mirror.push(tag);
    mirror.push(innerText);
    mirror.push('Open')
  } else if (/<\/(\w)*>/g.test(line)) {
    result = line.match(/<\/(\w)*>/, 'g');
    // console.log(result);
    tag = trimEdges(result[0].toString(), 2, 1);
    // tag = result[0];
    // console.log(tag);
    innerText = '';
    mirror.push(tag);
    mirror.push(innerText);
    mirror.push('Close')
  }
  // console.log(tag);
  // console.log(mirror);
  return mirror;
}

function firstCharIs(str, prefix){
  if (prefix == str.substring(0,1)){
    return true;
  } else {
    return false;
  }
}

var shadowCSS = {
  build : function(str) {
    console.log('Generating shadowCSS object:');
    var selectors = getCSSAllSelectors(str);
    for (var i = 0; i < selectors.length; i++) {
      let self = shadowCSS;
      let selector = selectors[i];
      // console.log(selectors);
      let newName = convertName(selector, 'buffer');
      self[newName] = {};
      let result = getCSSBySelector(str, selector);
      // console.log(result);
      let keys = result[0];
      let values = result[1];
      for (var e = 0; e < keys.length; e++) {
        var thisKey = keys[e];
        var thisValue = values[e];
        self[newName][thisKey] = thisValue;
        console.log(newName + " > " + thisKey + ": " + thisValue);
      };
    };
    console.log(shadowCSS);
  },
  send : function() {
    let self = shadowCSS;
    var style = '';
    for (let [key, value] of Object.entries(shadowCSS)) {
      if ((key === 'build')|(key === 'send')|(key === 'reset')) continue;
      let properName = convertName(key, 'fix');
      let lines = [`${properName} {\r\n`];
      for (let [index, data] of Object.entries(shadowCSS[key])) {
        lines.push("\t" + index + ": " + data + ";\r\n")
        // document.documentElement.style.setProperty('--' + key + index, data);
      }
      lines.push(`}\r\n`);
      lines.forEach(function(v,i,a){
        style += v;
      })
    };
    console.log("Generating stylesheet with shadowCSS.send():");
    console.log(style);
  },
  reset : function(e) {
    for (let [key, value] of Object.entries(shadowCSS)) {
      if ((key === 'build')|(key === 'send')|(key === 'reset')) continue;
      // for (var index in shadowCSS[key]) delete shadowCSS[key][index];
      delete shadowCSS[key];
    }
    console.log(shadowCSS);
  },
};
// shadowCSS.build(fakeCSS);
// shadowCSS.send();
// shadowCSS.reset();



function regSVGFormula(name){
  var value = false;
  name.replace(/^(\/)\\\//, 'g');
  var suffix = `=("|')([^("|')]*)(?="|')`;
  try {
    return new RegExp(name + suffix, "g");
  } catch(e){return false}
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

function getCSSAllSelectors(str){
  // var reg = /[^\s].*(?=\s\{)/g;
  var reg = /[^\s](\.|\#|\w|\-)*(?=(\,)|(\s\{))/gm;
  var contents = str.match(reg);
  // console.log(contents);
  return contents;
}


getCSSBySelector(fakeCSS, 'body')

var fakeMultiSelectors = `#someId, .someClass, someTag {
  background: red;
  property: whatnot;
}`;

var fakeMonoSelector = `someTag {
  property: something;
}`;



/** @function shadowCSS.build() breaks if multi-selector. Fix to isolate and duplicate **/
//
// parseMultiSelectors(fakeMultiSelectors);
// parseMultiSelectors(fakeMonoSelector);
function parseMultiSelectors(str){
  let args = false;
  let multiParams = /.*{/;
  let paramParse = /[^\s](\.|\#|\w|\-)*(?=(\,)|(\s\{))/gm;
    // multi-selector with omissions?
  // let regExBlock = arg + `(\#|\w|\.|\d|\,|\s|\:)*\s{([^}]*)}`;
  try {
    let params = str.match(multiParams);
    args = params[0].match(paramParse);
  } catch (e) {
    console.log('Whoops');
  }
  console.log(args);
  return args;
}


function getCSSBySelector(str, arg) {
  // console.log(str);
  // console.log(arg);
  let value = false;
  let keys = [];
  let regExBlock = arg + `(\#|\w|\.|\d|\,|\s|\:)*\s{([^}]*)}`;
  let regEx = arg + `\\s{([^}]*)}`;
  let reg = new RegExp(regEx, "g");
  let allResult = [];
  let keysAndValues = [];
  if (reg.test(str)){
    value = str.match(reg);
    let block = value[0];
    keys = getKeysFromCodeBlock(block);
    // console.log(keys);
    for (var i = 0; i < keys.length; i++){
      let thisKey = keys[i];
      let line = getCSSLineByKey(block, keys[i]);
      let result = getCSSValuefromLine(line, thisKey);
      // console.log(result);
      allResult.push(result);
    }
  } else {
    console.log('No match, use a valid CSS selector.');
    return false;
  }
  keysAndValues.push(keys)
  keysAndValues.push(allResult);
  return keysAndValues;
}


function getKeysFromCodeBlock(str){
  var reg = /\w.*(?=:)/g;
  var contents = str.match(reg);
  return contents;
}

function getCSSLineByKey(str, key){
  var value = false;
  var regEx = key + `.*;`;
  var reg = new RegExp(regEx, "g");
  if (reg.test(str)) {
    value = str.match(reg);
  }
  // console.log('Line by key: ' + value[0]);
  return value[0];
}

function getCSSKeysBySelector(str){
  var contents = str.match(regCSS.key);
  return contents[0];
}


function getCSSValuefromLine(line, key){
  var contents = trimL(line.match(regCSS.value)[0], 2);
  return contents;
}


// getValuesOfParentAttributes(testSVG)
function getValuesOfParentAttributes(str) {
  var contents = str.match(regSVG.isClass);
  return contents;
}





// convertName('.someClass', 'buffer');
// convertName('classsomeClass', 'fix');
// convertName('#someId', 'buffer');
// convertName('idsomeId', 'fix');
function convertName(str, type){
  var result = false;
  let prefix = str.substring(0,1);
  var regClass = /^class/i;
  var regId = /^id/i;
  if (type == 'buffer'){
    if (str.substring(0,1) == '#') {
      result = strReplace(str, '#', 'id');
    } else if (str.substring(0,1) == '.') {
      result = strReplace(str, '.', 'class');
    } else {
      return str;
    }
  } else if (type == 'fix'){
    if (regClass.test(str)) {
      result = str.replace(regClass, '.');
    } else if (regId.test(str)) {
      result = str.replace(regId, '#');
    } else {
      return str;
    }
  }
  // console.log(result);
  return result;
}

// lookBehind('null', 'none')
//
// function lookBehind(str, arg) {
//   // 'a\\,bcde,fgh,ijk\\,lmno,pqrst\\,uv'
//   var reg = new RegExp('/([^' + arg + '\\']);
//   var result = 'a\\,bcde,fgh,ijk\\,lmno,pqrst\\,uv'.replace(),/g, '$1\u000B').split('\u000B');
//   // var result = str.replace(/([^\\]),/g, '$1' + arg).split(arg)
//   console.log(result);
// }
// (/([^\\]),/g, '$1\u000B')
