goog.require('goog.dom');

function sayHi() {
  var newHeader = goog.dom.createDom('h1', {'style': 'background-color:#EEE'},
   "Hello World!");
  //var newParagraph = goog.dom.createDom('p',"Hi I'm wil!");
  goog.dom.appendChild(document.body, newHeader);
  //goog.dom.appendChild(document.body, newParagraph);
}