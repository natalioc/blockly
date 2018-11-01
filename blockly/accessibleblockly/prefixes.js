'use strict';
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview object that names each block with its specified prefix
 * @author Amber Libby, Alex Bowen, Mary Costa
 */

goog.provide('Blockly.Accessibility.Prefixes');

Blockly.Accessibility.Prefixes.ol = document.createElement("ol");
Blockly.Accessibility.Prefixes.usedKeys = [];

Blockly.Comment.prototype.defaultsetText = Blockly.Comment.prototype.setText;

/*
* Altered implentation of Blocklys setText function for compatibility with the comment display box.
*/
Blockly.Comment.prototype.setText = function(text){
  this.defaultsetText(text);
  if(Blockly.selected){
      Blockly.Accessibility.Speech.Say(" comment: " + Blockly.selected.comment.getText());
  }
}

/**
 * Retrieves the comments and places them into the comment div on the page
 * Puts all the comment blocks into p tags
 */
Blockly.Accessibility.Prefixes.displayComments = function(){
    //kills the old data in the div
    document.getElementById("comment").innerHTML = "";

    var pTag; //the p tag element

    var commentStr = ''; //comment string for each block
    var blockArr = xmlDoc.getElementsByTagName('BLOCK'); //all the blocks in the XML
    var commentArr = xmlDoc.getElementsByTagName('COMMENT'); //all the comments

    //the map holding all prefixes and their respective id's
    var map = Blockly.Accessibility.Prefixes.getAllPrefixes();

    //There are no comments for any of the blocks on the page
    if(commentArr.length == 0){
      pTag = document.createElement("p");
      pTag.setAttribute("id", 0);
      commentStr = "No Comments";
      var pTextNode = document.createTextNode(commentStr);//add commentStr to a text node
      pTag.appendChild(pTextNode);//add text node to the p tag
      document.getElementById("comment").appendChild(pTag);//append the p tag to the comment div
    }
    else{
      for(var i = 0; i <= commentArr.length - 1; i++){//go through for each comment
        pTag = document.createElement("p");
        pTag.setAttribute("tabindex", 0);
        commentStr = " ";//empty the previous commentStr
        pTag.setAttribute("id", i);//on each p tag there is an attribute equal to the id of the block
        //look for the id in the map containing the prefixes
        commentStr += map[commentArr[i].parentNode.getAttribute('id').toString()];//place the prefix in commentStr
          commentStr += " - " + commentArr[i].childNodes[0].data;//add the comment after the prefix in commentStr

        var pTextNode = document.createTextNode(commentStr);//add commentStr to a text node
        pTag.appendChild(pTextNode);//add text node to the p tag
        document.getElementById("comment").appendChild(pTag);//append the p tag to the comment div
    }
  }
};

/**
 * Generates the information in the info box (on the workspace corner)
 *
 * @param {currentNode} the current node
 */
Blockly.Accessibility.Prefixes.infoBoxFill = function(currentNode){
  //checks if the workspace is empty
  if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }

  //this.displayComments();
  var map = this.getAllPrefixes();
    //kills previous text in the div
  document.getElementById("infoBox").innerHTML = "";

    //Add all xml blocks to blockArr
    var blockArr = xmlDoc.getElementsByTagName('BLOCK');
  var sectionStr = '';//overall section of the current block
  var depthStr = '';//depth of the current block
  var prefixStr = '';//prefix of the current block
  //html p elements for section, depth, prefix
  var sectionP = document.createElement('p');
  var depthP = document.createElement('p');
  var prefixP = document.createElement('p');


  //Build String to put in box
  for (var i = 0; i <= blockArr.length - 1; i++) {

    var secondCharInPrefix = map[currentNode.getAttribute('id').toString()].substring(1,2);//the second letter of the prefix
    var secondCharResult = parseInt(secondCharInPrefix);//either an int or NaN
    //two capital letters at the beginning of the prefix
    if(!secondCharResult){//true if two letters at the beginning of the prefix
      sectionStr = map[currentNode.getAttribute('id').toString()];//get the prefix
      sectionStr = "Section: " + sectionStr.substring(0,   2);//get the first char from the prefix
    }
    else{//one capital letter in the prefix
      sectionStr = map[currentNode.getAttribute('id').toString()];
      sectionStr = "Section: " + sectionStr.charAt(0);//first char of the prefix
    }
    depthStr = map[currentNode.getAttribute('id').toString()];//currentNode id
    depthStr = "Depth: " + (depthStr.match(/./g).length / 2);//count how many '.' in the prefix
    prefixStr = map[currentNode.getAttribute('id').toString()]; //the prefix
  }
  //add the strings from above to textNodes
  var sectionTextNode = document.createTextNode(sectionStr);
  var depthTextNode = document.createTextNode(depthStr);
  var prefixTextNode = document.createTextNode(prefixStr);
  //add the textNodes to the p elements
  sectionP.appendChild(sectionTextNode);
  depthP.appendChild(depthTextNode);
  prefixP.appendChild(prefixTextNode);
  //append the p elements to the infoBox div
  document.getElementById('infoBox').appendChild(sectionP);
  document.getElementById('infoBox').appendChild(depthP);
  document.getElementById('infoBox').appendChild(prefixP);
};

/**
 * Toggles the information box visible or invisible
 * Dependent on what the current style is
 */
Blockly.Accessibility.Prefixes.getInfoBox = function(){
  if(document.getElementById('infoBox').style.visibility == 'visible'){
    document.getElementById('infoBox').style.visibility='hidden';
  }
  else{
    document.getElementById('infoBox').style.visibility='visible';
  }
};

//******************************************************************************************
//*                                                                                        *
//* TREE VIEW FUNCTIONS                                                                    *
//*                                                                                        *
//******************************************************************************************
/*
 * New version of formatTreeView used to create the comment tree
 */
Blockly.Accessibility.Prefixes.generateTree = function(){

  var parentBlocks = Blockly.mainWorkspace.getAllBlocks(true);
  var  ul =  document.getElementById("commentList");
  ul.innerHTML = "";
  this.createCommentTree(parentBlocks, ul,[]);
}

/*
 * Recursive function to organize the comments correctly
 * @param_nodes.....array of blocks;
 * @param_ul....Original list to add comments to;
 * @param_prev.... Empty array; 
 */
Blockly.Accessibility.Prefixes.createCommentTree= function(nodes, ul, prev){
      var prevBlocks= prev;
	  var  p =  document.getElementById("comment");
	  var parentlength = nodes.length;
	  for (var i = 0; i < parentlength; i++) {
		// If block is already in array skip code below.
		if(prevBlocks.includes(nodes[i]))
			continue;
		prevBlocks.push(nodes[i]);
		// If block has comment, add it to list.
		if (nodes[i].comment!= null){
	    var listItem = document.createElement('li');
	    listItem.textContent = nodes[i].comment.getText();
	    ul.appendChild(listItem);
		}
	    // If no children, return early to skip code below.
	    if(nodes[i].getNestedChildren().length ==0) 
	    	continue;

	    // Process descendants next.
	    var childList = document.createElement('ul');
	    var child = nodes[i].getNestedChildren();
	    this.createCommentTree(child, childList,prevBlocks);
	    if(childList.getElementsByTagName('li').length >= 1){
	    ul.appendChild(childList);
	    }
	    
	  }

	  // Only when the list is fully formed do we append it to the parent
	  p.appendChild(ul);
	}


/*
 * Recursive N-ary search function to organize the comments correctly
 * @param_block.....svg object of top block;
 * @param_indent....bool indented
 * @param_bottom.... The lowest level ul or li 
 */
Blockly.Accessibility.Prefixes.narySearchTree = function(block, indent, bottom){
  
  var ul = document.getElementById("commentList");
  var  p =  document.getElementById("comment");
  var children = block.getChildren();
  var length = children.length;
  console.log(length);
  console.log(!block.comment);
  if(!block.comment){
    block.comment.setText(" ");
  }

  var commentText = block.comment.getText();
  console.log(commentText);
  var botUls = bottom.getElementsByTagName("UL");
  var botLis = bottom.getElementsByTagName("LI");
  console.log(botUls);
  console.log(botLis);
  var commentLi = document.createElement("li");
  
  //indent
  if(indent == 1){

    //loop through  
    var prevBottom;
    console.log(bottom.nodeName);
    while(bottom.nodeName != "LI"){

      prevBottom = bottom;
      bottom = bottom.childNode;

      if(!bottom){
        bottom = prevBottom;
        if(prevBottom.nodeName != "LI" && prevBottom != ul){
          bottom = bottom.parentNode;
        }
        break;
      }
    }

    //create new ul and comment li
    var indentedUl = document.createElement("ul");

    //put everything together
    commentLi.appendChild(document.createTextNode(commentText));
    indentedUl.appendChild(commentLi);
    bottom.appendChild(indentedUl);

    if(!ul.contains(bottom)){
       ul.appendChild(bottom);
       p.appendChild(ul); 
    }
  }
 
  //first block
  else if(indent ==2){

    commentLi.appendChild(document.createTextNode(commentText));
    ul.appendChild(commentLi);
    p.appendChild(ul);
  }
  //dont indent further 
  else{
    //find last <ul> to add <li> to
    commentLi.appendChild(document.createTextNode(commentText));
    while(bottom.nodeName != "UL"){
      bottom = bottom.parentNode;
    }
    bottom.appendChild(commentLi);
    if(!ul.contains(bottom)){
        ul.appendChild(bottom);
        p.appendChild(ul);
    }
  }

  var newIndent;
  var newBottom;

  //go through all children
  for(var i = 0; i < length; i++)
  { 
      //indent
      if(i == 0){ 
        newIndent = 1;            
        newBottom = botLis[0];
      }

      //dont indent
      else{
        index = 0;
        newIndent = 0;

        if(botLis[0] == newBottom && newBottom != ul){
          newBottom = botLis[1];
        }
        else{
          newBottom = botLis[0];
        }
      }

      if(!newBottom){
        newBottom = bottom;
      }
      this.narySearchTree(children[i], newIndent, newBottom);
  }
}



/**
*  WORK HERE TO FINISH BUILDING THE TREE VIEW FOR THE BLOCK COMMENTS SHOULD BUILD IT TO WORK WITH ALL BLOCKS
*  THEN SHRINK IT DOWN TO BLOCKS THAT CONTAIN COMMENTS. THE FUNCTIONS BELOW WILL PUT ITEMS INTO FILE OR FOLDER
*  NODES I LEFT IN COMMENTED OUT CODE THAT. WE STILL NEED TO FIND WHEN TO CALL THIS FUNCTION  SO THAT IT IS FUNCTIONAL
*  IT DOESN"T WORK ON UPDATEXML ANYMORE.
*  Builds the treeview for comments
*/
// Blockly.Accessibility.Prefixes.formatTreeView = function(){

//   document.getElementById("comment").innerHTML = ""; //clear what is currently in the div
//   var map = this.getAllPrefixes(); //get all the blocks
//   var commentStr;
//   //var commentArr = xmlDoc.getElementsByTagName('COMMENT'); //all the comments to be added in later
//   var firstFolder = this.buildBasis(); //The top folder that says Block Comments
//   var fullTree = document.createElement("ol"); //to build the structure you need to put prefices in ol and li tags
//   var lastPeriodCount = 1;
//   var firstEqualDepthRun = true;
//   var firstLastGreaterDepthRun = true;
//   //var ol = document.createElement("ol");
//   var text = Blockly.selected.comment.getText();
//   var li; //= this.buildFileNode(map[key] + " " + text);
//   var commentText;

      

//   //document.getElementById('comment').appendChild(firstFolder); //append the comments to the base folder
//   fullTree.setAttribute("class", "tree");
//   console.log(map);
//   for (var key in map) { //loops through the entire hashmap of blocks

//     if(this.usedKeys.includes(map[key])){
//       console.log(this.usedKeys);
//       this.usedKeys
//       continue;
//     }
//     else{
//        console.log("else");
//        this.usedKeys.push(map[key]);
//     }



//     // don't do anything if the text area is open
//     if (map.hasOwnProperty(key) && !(Blockly.selected.comment.textarea_)){


//       var prefix = map[key];
//       var currentPeriodCount = prefix.replace(/[^0-9]/g,"").length;//how many periods are in the string


//       //if(!prefix[1].match(/[a-z]/i)){ //check if the prefix has 1 or 2 starting characters
//       if(prefix.includes(".")){
//         console.log("1");
//         //this case is for single alphabetical starting prefixes ex. A
//         if(lastPeriodCount == currentPeriodCount){
//           console.log("2");
//           if(firstEqualDepthRun == true){
//             console.log("3");
//             var ol = document.createElement("ol");
//             var li = this.buildFileNode(prefix);
//             ol.appendChild(li);
//             firstFolder.appendChild(ol);
//             fullTree.appendChild(firstFolder);
//             document.getElementById('comment').appendChild(fullTree);
//             firstEqualDepthRun = false;
//             lastPeriodCount = currentPeriodCount;
//           }
//           else{
//             console.log("4");
//             var li = this.buildFileNode(prefix);
//             ol.appendChild(li);
//             firstFolder.appendChild(ol);
//             fullTree.appendChild(firstFolder);
//             document.getElementById('comment').appendChild(fullTree);
//             firstEqualDepthRun = false;
//             lastPeriodCount = currentPeriodCount;
//           }
//         }
//         //nested statements
//         if(lastPeriodCount < currentPeriodCount){
//           console.log("5");
//           if(firstLastGreaterDepthRun == true){
//             console.log("6");
//             console.log(Blockly.selected);
//             //var prevComment = Blockly.selected.parentBlock_.comment.getText();
//             var fileToFolder = this.convertFromFileToFolderNode(li, prefix);
//             var ol = document.createElement("ol");
//             //ol.appendChild(fileToFolder);
//             //this.ol.appendChild(fileToFolder);
//             firstFolder.childNodes[currentPeriodCount].appendChild(fileToFolder);
//             fullTree.appendChild(firstFolder);
//             //document.getElementById('comment').appendChild(fullTree);
//             lastPeriodCount = currentPeriodCount;
//             firstLastGreaterDepthRun = false;

//           }
//           else{
//             console.log("7");
//             li = this.buildFileNode(map[key] + " " + text);
//             var fileToFolder = this.convertFromFileToFolderNode(li, prefix);
//             var ol = document.createElement("ol");
//             //ol.appendChild(fileToFolder);
//             //console.log(firstFolder.childNodes[lastPeriodCount].childNodes);
//             firstFolder.childNodes[lastPeriodCount].childNodes[0].appendChild(fileToFolder);
//             fullTree.appendChild(firstFolder);
//             document.getElementById('comment').appendChild(fullTree);
//             lastPeriodCount = currentPeriodCount;
//             firstLastGreaterDepthRun = true;
//           }
//         }
//         else{
//             console.log("8");
//         }
//       }
        
//         //var li = this.buildFileNode(map[key] + " " + Blockly.selected.comment.getText());
//         //var ol = document.createElement("ol");
//         li = this.buildFileNode(map[key] + " " + text);
//         Blockly.Accessibility.Prefixes.ol.appendChild(li);
//         //firstFolder.appendChild(Blockly.Accessibility.Prefixes.ol);
//         //fullTree.appendChild(firstFolder);
//         //document.getElementById('comment').appendChild(fullTree);
//     }

//   }

//       firstFolder.appendChild(Blockly.Accessibility.Prefixes.ol);
//       fullTree.appendChild(firstFolder);
//       document.getElementById('comment').appendChild(fullTree);

// };

// /**
// *  Builds the base of the tree view labels it as block comments and is returned to be appended to the comment div
// *   @return {li} li containing the top folder for the comments section
// */
// Blockly.Accessibility.Prefixes.buildBasis = function(){
//   var li = document.createElement("li");
//   var label = document.createElement("label");
//   var input = document.createElement("input");
//   var title = document.createTextNode("Block Comments");
//   label.setAttribute("for", "topFolder");
//   label.appendChild(title);
//   input.setAttribute("type", "checkbox");
//   input.setAttribute("id", "topFolder");
//   li.appendChild(label);
//   li.appendChild(input);
//   return li;
// };

// /**
// *  Builds a file node for the tree view
// */
// Blockly.Accessibility.Prefixes.buildFileNode = function(prefixName){
//   var li = document.createElement("li");
//   var pTextNode = document.createTextNode(prefixName);
//   var aTag = document.createElement("a");
//   li.setAttribute("class","file")
//   aTag.appendChild(pTextNode);
//   li.appendChild(aTag);
//   return li;
// };

// /**
// * Converts a file tree node into a folder node
// * @param{li , prefix} give it the previous li and the new prefix
// * @return{li} a li that contains the new folder and the new prefix name
// */
// Blockly.Accessibility.Prefixes.convertFromFileToFolderNode = function(li, newPrefix){
//   var label = document.createElement("label");
//   var input = document.createElement("input");
//   var prefix = li.childNodes[0];
//   var belowNode = this.buildFileNode(newPrefix);
//   var ol = document.createElement("ol");
//   ol.appendChild(belowNode);
//   li.removeAttribute("class");
//   li.removeChild(li.childNodes[0]);
//   label.setAttribute("for", prefix);
//   label.appendChild(prefix);
//   input.setAttribute("type", "checkbox");
//   input.setAttribute("id", prefix);
//   li.appendChild(label);
//   li.appendChild(input);
//   li.appendChild(ol);
//   return li;
// };

//******************************************************************************************
//*                                                                                        *
//* PREFIX FUNCTIONS                                                                       *
//*                                                                                        *
//******************************************************************************************

/**
 * Generates the alphabetical representation of the number you give it
 * @param {int} int to be converted into it's alphabetical representation
 * @return {str} a string will be returned of either single alphabetical or a double alphabetical
 * if the regular alphabet is exceeded
 */
Blockly.Accessibility.Prefixes.getAlphabetical = function(number) {
  var alphabetList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  var numberCount = 0;//used to tell the first letter when there are 2 letters together
  var repeatLetter = '';//the first letter in the grouped letters
  var bigLetter = '';//the complete letter
  while(number > 25) {//only in here if there is 2 letters grouped together
    repeatLetter = alphabetList[numberCount];//first letter
    numberCount++;
    number = number - 26;//new index of the next letter
  }
  if(numberCount > 0)//only in here if there is 2 or more letters together
  {
    bigLetter = repeatLetter + alphabetList[number];//gets the first letter and adds the second letter
    return bigLetter;
  }
  //only one letter
  return alphabetList[number];
};

/**
* When given a alphabetical letter convert it into it's number equivilient
* If the letter has doubles ex AC. it will return 26 + 3 = 29
* @param {str} str to be converted into an int
* @return {int} a integer representation of a letter
*/
Blockly.Accessibility.Prefixes.getNumberFromAlphabetical = function(str) {
  var alphabetList = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm', 'n',
  'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z'];
  if(str.length != 1){
    var firstLetter = alphabetList.indexOf(str[0].toLowerCase());
    var secondLetter = alphabetList.indexOf(str[1].toLowerCase());
    if(firstLetter == 0){
      firstLetter = 26;
    }
    else{
      firstLetter = firstLetter * 26;
    }
    return firstLetter + secondLetter;
  }
  else{
    return alphabetList.indexOf(str.toLowerCase());
  }
};

/**
* returns the top parent of a VALUE block
* recursively finds the parents of the VALUE until the top parent is reached
* to be called only when currently inside of a VALUE
* @return {node} the top block of a value
*/
Blockly.Accessibility.Prefixes.getValueTop = function(block){

  if(block.parentNode.nodeName.toUpperCase() == 'VALUE'){
    block = block.parentNode.parentNode;//set the new block equal to the parent of the current block
    return this.getValueTop(block);//checks this new block to see if it is also the top parent of a VALUE block
  }
  //When block is the top parent of a VALUE block - simply return
  return block;
};

/**
 * Function will retrieve all blocks and attach a prefix to them in a hashmap
 * This function is overly complex and can probably broken down into better parts
 * but I don't have the time to be able to modify it.
 * @return {map} a hashmap of all the blocks id's and their associated prefix's
 */
Blockly.Accessibility.Prefixes.getAllPrefixes = function() {
  //Check if the workspace is empty
  if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }
    //Add all xml blocks to blockArr
    this.giveAllBlocksIds();
    var blockArr = xmlDoc.getElementsByTagName('BLOCK');
    var map = {}; //hashMap with Block Id's and their associated prefix ex Block:19 , A1.3
    var capitalAlphabet = 0;//count of which letter should be chosen from the alphabet array
    var lowerAlphabet = 0;//count of which letter should be chosen from the alphabet array
    var oldPrefix = '';
    var blockIndex = 1;
    var emptyVisited = true;
    var previousTopBlock = null;
    var previousParentValue = null;
    var bigChange = false; //an array boolean for which case prefix it should generate
    var valueArr = [];//an array that handles the regular values
    var functionArr = []; //an array to handle the function return block that behaves differently
    var emptyValueArr = []; //an array to handle empty values (EX. not block)
    for (var i = 0; i <= blockArr.length - 1; i++) {
       //only the blocks that arent connected to anything
       if(blockArr[i].parentNode.nodeName == 'XML'){
         blockIndex = 1;
         oldPrefix = this.getAlphabetical(capitalAlphabet).toUpperCase() + blockIndex;
         capitalAlphabet++;
        map[blockArr[i].getAttribute('id').toString()] = oldPrefix;
        lowerAlphabet = 0;
         emptyVisited = true;
         blockIndex++;
       }
       //only the blocks that have no children
       if(blockArr[i].childNodes.length == 0){
         //you need to check if a childless block has already been visited so it is not repeated
         if(emptyVisited == true){
           emptyVisited = false;
         }
         //add the empty value to an array for post processing
         else{
           emptyValueArr.push(blockArr[i]);
         }
       }
     for (var j = 0; j < blockArr[i].childNodes.length; j++) {
       //only the blocks nested inside of a block
       if(blockArr[i].childNodes[j].nodeName == 'VALUE'){
         emptyVisited = true;
         //since the function block's children are different to other blocks we have a check for that block specifically
         //we add it to an array for post processing after going through all the blocks
         if(this.getValueTop(blockArr[i].childNodes[j].childNodes[0]).getAttribute('type') == 'procedures_defreturn'){
           functionArr.push(blockArr[i].childNodes[j].childNodes[0]);
         }
         else{
           valueArr.push(blockArr[i].childNodes[j].childNodes[0]);
         }
       }
       //if you have a statement (going outward)
       else if(blockArr[i].childNodes[j].nodeName == 'STATEMENT'){
         lowerAlphabet = 0;
         emptyVisited = true;
         oldPrefix = map[blockArr[i].childNodes[j].parentNode.getAttribute('id').toString()] + ".1";
        map[blockArr[i].childNodes[j].childNodes[0].getAttribute('id').toString()] = oldPrefix;
       }
       //if you have a next block (going down)
       else if(blockArr[i].childNodes[j].nodeName == 'NEXT'){
         lowerAlphabet = 0;
         emptyVisited = true;
         oldPrefix = map[blockArr[i].childNodes[j].parentNode.getAttribute('id').toString()];
         //gets the last number so that the new number is incrimented
         var lastGoodNumber = parseInt(oldPrefix.charAt(oldPrefix.length - 1, 10));
         oldPrefix = oldPrefix.substring(0, oldPrefix.length - 1) + (lastGoodNumber + 1);
        map[blockArr[i].childNodes[j].childNodes[0].getAttribute('id').toString()] = oldPrefix;
       }
     }
  }
  lowerAlphabet = 0;
  //this handles all regular values (every value that's not a fucntion w/return block)
  //and puts them into a logical order
  if(valueArr.length > 0){
    for (var i = 0; i <= valueArr.length - 1; i++) {
      emptyVisited = true;
      var topBlock = this.getValueTop(valueArr[i]);
      //this will check the highest block to keep things consistent
      if(previousTopBlock == null){
        previousTopBlock = topBlock;
      }
      if(previousTopBlock != topBlock){
        lowerAlphabet = 0;
        previousTopBlock = topBlock;
        bigChange = true;
      }
      //creates prefixes
      var parentValue = valueArr[i].parentNode.parentNode;
      if(previousParentValue == null){
        previousParentValue = parentValue;
      }
      if(previousParentValue != parentValue){
        lowerAlphabet = 0;
        previousParentValue = parentValue;
        bigChange = false;
      }
      if(bigChange == true){
        oldPrefix = map[topBlock.getAttribute('id')];
        oldPrefix = oldPrefix + this.getAlphabetical(lowerAlphabet);
        map[valueArr[i].getAttribute('id').toString()] = oldPrefix;
        lowerAlphabet++;
      }
      else{
          if(valueArr[i].getAttribute('id')!=null){
              oldPrefix = map[previousParentValue.getAttribute('id')];
              oldPrefix = oldPrefix + this.getAlphabetical(lowerAlphabet);
              map[valueArr[i].getAttribute('id').toString()] = oldPrefix;
              lowerAlphabet++;
          }
      }
    }
  }
  previousTopBlock = null;
  topBlock = null;
  parentValue = null;
  previousParentValue = null;
  lowerAlphabet = 0;

  //handles empty values and blocks
  if(emptyValueArr.length > 0){
    for (var i = 0; i <= emptyValueArr.length - 1; i++) {
      emptyValueArr[i]
      //get your parents prefix so you know how to build yours
       oldPrefix = map[emptyValueArr[i].parentNode.parentNode.getAttribute('id').toString()];
      var lastPrefixStr = oldPrefix[oldPrefix.length - 1];
      if(lastPrefixStr.match(/[a-z]/i)){
        oldPrefix = oldPrefix.substring(0, oldPrefix.length - 1);
        oldPrefix = oldPrefix + lowerAlphabet;
      }
      else{
         oldPrefix = oldPrefix.substring(0, oldPrefix.length - 1);
         oldPrefix = oldPrefix + blockIndex;
        map[emptyValueArr[i].getAttribute('id').toString()] = oldPrefix;
         blockIndex++;
       }
       }
  }
  //handles function return blocks since they are set up differently than regular blocks
  if(functionArr.length > 0){
    //this for loop makes the prefixes for the function return block
    for (var i = 0; i <= functionArr.length - 1; i++) {
      //this checks if the top block is the same if its not then the alphabet needs
      //to be reset
      var topBlock = this.getValueTop(functionArr[i]);
      if(previousTopBlock == null){
        previousTopBlock = topBlock;
      }
      if(previousTopBlock != topBlock){
        lowerAlphabet = 0;
        previousTopBlock = topBlock;
      }
      var parentValue = functionArr[i].parentNode.parentNode;
      if(previousParentValue == null){
        previousParentValue = parentValue;
      }
      if(previousParentValue != parentValue){
        lowerAlphabet = 0;
        previousParentValue = parentValue;
        bigChange = false;
      }
      if(bigChange == true){
        oldPrefix = map[topBlock.getAttribute('id')];
        oldPrefix = oldPrefix + this.getAlphabetical(lowerAlphabet);
        map[functionArr[i].getAttribute('id').toString()] = oldPrefix;
        lowerAlphabet++;
      }
      else{
        oldPrefix = map[previousParentValue.getAttribute('id')];
        oldPrefix = oldPrefix + this.getAlphabetical(lowerAlphabet);
        map[functionArr[i].getAttribute('id').toString()] = oldPrefix;
        lowerAlphabet++;
      }
    }
  }
    return map;
};

/**
* Function that gives all blocks that exist on the workspace ID's since Neil removed those ID's in one of his updates
*/
Blockly.Accessibility.Prefixes.giveAllBlocksIds = function(){
    var blocks = xmlDoc.getElementsByTagName('BLOCK');
    for(var i = 0; i < blocks.length; i++){
        blocks[i].setAttribute("id", i);
    }
};


