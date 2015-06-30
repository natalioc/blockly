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
 * @fileoverview object that retrieves an array of blocks in the workspace and generates comments.
 * @author Amber Libby, Alex Bowen, Mary Costa, Rachael Bosley, Luna Meier
 */

/**
 * gets all of the blocks that aren't conditionals and calls get indent on the array list it generates
 */
Blockly.BlockSvg.prototype.defaultFireChangeEvent = Blockly.BlockSvg.prototype.fireChangeEvent;

var perfectArr = []; //WHAT IS THIS?
var prefixArr = []; //WHAT IS THIS?
var parentArr = []; //WHAT IS THIS?
var stateChange = false;

/**
 * NEEDS A COMMENT
 */
Blockly.WorkspaceSvg.prototype.fireChangeEvent = function() {
  if (this.rendered && this.svgBlockCanvas_) {
    Blockly.fireUiEvent(this.svgBlockCanvas_, 'blocklyWorkspaceChange');
    stateChange = true;
  }
};

/**
 * NEEDS A COMMENT
 */
Blockly.Accessibility.TreeView.callImportantBlocks = function() {
	if(stateChange == true) {
		Blockly.Accessibility.TreeView.getImportantBlocks();
		stateChange = false;
	}
};

/**
 * NEEDS A COMMENT
 */
Blockly.Accessibility.TreeView.getImportantBlocks = function(){
	//Check if the workspace is empty
	if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
		console.log("nothings here");
        return null;
    }
    //Add all blocks to blockArr 
     var blockArr = xmlDoc.getElementsByTagName('BLOCK'); //BLOCKARR IS WHAT?

    perfectArr = []; //CALL AGAIN??

    //adding any blocks which can stand on their own to perfectArr 
    for(var i=0; i < blockArr.length; i++){ //THIS SHOULD BE CONDENSED

		var strType = blockArr[i].getAttribute('type'); //WHAT IS THIS FOR?

		if(strType.match(/controls/g)){
			perfectArr.push(blockArr[i]);
		}
		else if(strType.match(/procedures/g)){
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "beep"){
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "math_change") {
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "text_append") {
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "text_print") {
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "list_setIndex") {
			perfectArr.push(blockArr[i]);
		}
		else if(strType == "variables_set") {
			perfectArr.push(blockArr[i]);
		}
	}
    Blockly.Accessibility.TreeView.getIndent(perfectArr);
};

/**
 * Gets how deeply indented all the provided blocks are and passes that array into 
 * the commentPrefix along with the perfectArr
 * @param {array} perfectArr is the array of blocks that we are checking their indentation ****THIS IS IMPORTANT****
 */
Blockly.Accessibility.TreeView.getIndent = function(perfectArr){

	//the string format of the current XML Doc
	var currentXml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
	
	var openStatementCnt; 
	var closeStatementCnt;
	var indexOfId;
	var idOfBlock;
	var miniXml; //WHAT IS THIS?
	var i;
	var currNode;
	parentArr = [];

	for(i = 0; i < perfectArr.length; i++){
		currNode = perfectArr[i];
		idOfBlock = currNode.getAttribute('id');
		indexOfId = currentXml.indexOf('id="'+idOfBlock+'"');
		miniXml = currentXml.substring(0, indexOfId);
		openStatementCnt = (miniXml.match(/<statement/g) || []).length;
		closeStatementCnt = (miniXml.match(/statement>/g) || []).length;
		parentArr[i] = openStatementCnt - closeStatementCnt;
		parentArr.push(parentArr[i]);
	}
	parentArr.splice(i);
	Blockly.Accessibility.TreeView.createComments(perfectArr, parentArr);
};

/**
 * Based on how the comments are placed this will generate their prefixes correctly to display them
 * in the proper order based on their indentation depth.
 * @param {array} perfectArr is the array of blocks that potentially have comments ***THIS IS A PROBLEM BECAUSE ANY BLOCK CAN HAVE A COMMENT****
 * @param {array} parentArr is an array that tracks how deeply nested the blocks are
 * @return {array} prefixArr is an array of the prefixes built for each block indent
 */
Blockly.Accessibility.TreeView.commentPrefix = function(perfectArr, parentArr){
	var zeroCount = 1;
    var allCount = 0;
    var prefixStringPrev; //WHAT IS THIS?
    prefixArr = []; //WHAT IS THIS?

    for (var i = 0; i < parentArr.length; i++) {
        if(parentArr[i].toString() == "0"){
            prefixArr[i] = "*" + zeroCount.toString();
            zeroCount++;
            //console.log("this is level 0");
        }
        else{
            var currentIndent = parentArr[i];
            var prevIndent = parentArr[i-1];

            if(currentIndent == prevIndent){
                //at the same indent level

                var shortStr = prefixArr[i-1].length-1;
                var prevCount = prefixArr[i-1].substring(shortStr);

                var newCount = parseInt(prevCount);
                newCount++;

                var preString = prefixArr[i-1].substring(0, shortStr);

                prefixArr[i] = preString + newCount;
            }
            else if(currentIndent > prevIndent){
                //there is another indent
                prefixArr[i] = prefixArr[i-1] + ".1";
                prefixStringPrev = prefixArr[i];
            }
            else if(currentIndent < prevIndent){
                //there is one less indent here
                var indentDiff = prevIndent - currentIndent;
                var takeStr = indentDiff * 2;

                var prevPrefixStr = prefixArr[i-1];
                var prevPrefixStrLength = prevPrefixStr.length;
                var subStrVal = prevPrefixStrLength - takeStr;

                var thePrevPre = prevPrefixStr.substring(subStrVal);
               //x is the prev prefix string name we need
                var x = prevPrefixStr.substring(0, subStrVal-2);

                //get the last char of the prev indent and up that value by 1 
                //and append to the end of the prev string and set equal to the new prefix

                var lastNum = prevPrefixStr.substring(subStrVal-1, subStrVal);
                var num = parseInt(lastNum);
                num++;
                prefixArr[i] = x + "." + num;
            }
        }
    }
    return prefixArr;
};

/**
 * Generates the comments and places them into the div in the HTML to display the comments on the page
 * with the right format of prefixes. It puts all the comment blocks into <p> tags so they properly
 * display on the web.
 * @param {array} perfectArr is the array of blocks that potentially have comments
 * @param {array} parentArr is an array that tracks how deeply nested the blocks are
 */
Blockly.Accessibility.TreeView.createComments = function(perfectArr, parentArr){
  //clears the comment div of old data
  document.getElementById("comment").innerHTML = "";

  var pTag; 
  var commentStr;
  var prefixes = Blockly.Accessibility.TreeView.commentPrefix(perfectArr, parentArr);
  var indent;
  var currNode;
  for(var i = 0; i < perfectArr.length; i++){
    commentStr = '';
    currNode = perfectArr[i];
    pTag = document.createElement("p");
    pTag.setAttribute("tabindex", 0);
    pTag.setAttribute("id", i);
    indent = parentArr[i];
    //checks how many indents a comment is going to have
    while(indent != 0) {
      commentStr += "---";
      indent--;
    }
    commentStr += " " + prefixes[i];

    if(perfectArr[i].getElementsByTagName("comment")[0] == undefined){
      commentStr += " No comment";
    } 

    else{
    	//if the block has a comment it will be shown otherwise it will print no comment
        var parentsId = perfectArr[i].getElementsByTagName("comment")[0].parentNode.getAttribute('id');
        if(parentsId == currNode.getAttribute('id')){
          var htmlComment = currNode.getElementsByTagName("comment")[0].innerHTML;
          commentStr += " " + htmlComment;
        }
        else{
          commentStr += " No comment";
        }
    }

    var pTextNode = document.createTextNode(commentStr);
    pTag.appendChild(pTextNode);
    document.getElementById("comment").appendChild(pTag);
  }
};

/**
* Uses the currently selected comment to jump to the block with the corresponding id.
*/
Blockly.Accessibility.TreeView.commentOrBlockJump = function(){
	//checks if something is not selected which would throw errors
	console.log(document.activeElement);
	
    if(getCurrentNode() != null && document.activeElement.id != "importExport") {

    	//jump from block to comment 
    	if(document.activeElement.id) {
    		var eleId = document.activeElement.id;
    		var blockId = perfectArr[eleId].getAttribute('id');
    		jumpToID(blockId);
    	}
    	else {
    		//jump from comment to block
    		var highlightedBlock = getCurrentNode();
			for (var i = 0; i < perfectArr.length; i++) {
	    		if(perfectArr[i].getAttribute('id') == highlightedBlock.getAttribute('id')) {
	    			document.getElementById(i).focus();
	    		}
	    	}
    	}
	}
};

/**
 * NEEDS A COMMENT
 */
Blockly.Accessibility.TreeView.infoBoxFill = function(currentNode){
	//erases any pre-existing text in the div
	document.getElementById("infoBox").innerHTML = "";
	var sectionStr = '';
	var depthStr = '';
	var prefixStr = '';
	var sectionP = document.createElement('p');
	var depthP = document.createElement('p');
	var prefixP = document.createElement('p');

	//Build String to put in box
	for (var i = 0; i < perfectArr.length; i++) {
		if(currentNode.getAttribute('id') == perfectArr[i].getAttribute('id')){	
			var indexOfPeriod = prefixArr[i].indexOf(".");
			if(indexOfPeriod == -1){
				var prefixLength = prefixArr[i].length;
				if(prefixLength == 2){
					sectionStr = "Section " + prefixArr[i].substring(1, 2);
				}
				else{
					sectionStr = "Section " + prefixArr[i].substring(1, 3);
				}
			}
			else if(indexOfPeriod == 2){
				sectionStr = "Section " + prefixArr[i].substring(1, 2);
			}
			else if(indexOfPeriod == 3){
				sectionStr = "Section " + prefixArr[i].substring(1, 3);
			}
			depthStr = "Depth " + (parentArr[i] + 1);
			prefixStr = prefixArr[i].substring(1, prefixArr[i].length+1);
		}
	}
	//puts the text onto the page and in the div
	var sectionTextNode = document.createTextNode(sectionStr);
	var depthTextNode = document.createTextNode(depthStr);
	var prefixTextNode = document.createTextNode(prefixStr);
	sectionP.appendChild(sectionTextNode);
	depthP.appendChild(depthTextNode);
	prefixP.appendChild(prefixTextNode);
	document.getElementById('infoBox').appendChild(sectionP);
	document.getElementById('infoBox').appendChild(depthP);
	document.getElementById('infoBox').appendChild(prefixP);
};

/**
 * NEEDS A COMMENT
 */
Blockly.Accessibility.TreeView.getInfoBox = function(){
	if(document.getElementById('infoBox').style.visibility == 'visible'){
		document.getElementById('infoBox').style.visibility='hidden';
	}
	else{
		document.getElementById('infoBox').style.visibility='visible';
	}
};

