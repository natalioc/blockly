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
 * @fileoverview object that creates the tree view with indentations 
 * @author Amber Libby, Alex Bowen, Mary Costa, Rachael Bosley, Luna Meier
 */

goog.provide('Blockly.Accessibility.TreeView');

var importantBlockArr = []; //an array of the blocks we will be checking for comments
var indentationArr = []; //an array that stores the depth of the blocks for indentation

/**
 * Returns an array of the important blocks
 * (the container blocks/ the blocks that can stand complete alone) 
 * in order of top to bottom then left to right
 * DOES not handle custom blocks
 * @return {array} Array of the important blocks
 */
Blockly.Accessibility.TreeView.getImportantBlocks = function(){
	//Check if the workspace is empty
	if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }
    //Add all xml blocks in the to blockArr 
    var blockArr = xmlDoc.getElementsByTagName('BLOCK');

	//empty importantBlockArr from previous
    importantBlockArr = []; 

    //adding any blocks which can stand on their own to importantBlockArr 
    for(var i=0; i < blockArr.length; i++) {
		//gets the type attribute of the block and sets value to strType
		var strType = blockArr[i].getAttribute('type'); 

		/*
		 important blocks are able to be found by the type attribute
		 associated with each block
		*/
		if(strType.match(/controls/g)){
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType.match(/procedures/g)){
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "beep"){//custom block check 
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "math_change") {
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "text_append") {
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "text_print") {
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "list_setIndex") {
			importantBlockArr.push(blockArr[i]);
		}
		else if(strType == "variables_set") {
			importantBlockArr.push(blockArr[i]);
		}
	}
	return importantBlockArr;
};

/**
 * Gets how deeply indented the important blocks are
 * NOT USED CURRENTLY - will not work with new prefix system
 * @param {array} array of blocks that we are checking their indentation
 */
Blockly.Accessibility.TreeView.getIndent = function(importantBlockArr){

	//a string format of the current XML Doc from the workspace
	var currentXml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
	
	var openStatementCnt; //how many opening STATEMENT
	var closeStatementCnt; //how many closing STATEMENT
	var indexOfId; //the index of where the id of the block is found in the currentXml string
	var idOfBlock; 
	var miniXml; //a substring of the currentXml from the beginning to indexOfId
	var currNode; //the important block currently trying to get the indent of
	var i;

	//stores the int value of how indented the important blocks are (in the same order as importantBlockArr)
	indentationArr = [];

	for(i = 0; i < importantBlockArr.length; i++){
		currNode = importantBlockArr[i];
		idOfBlock = currNode.getAttribute('id');
		indexOfId = currentXml.indexOf('id="'+idOfBlock+'"');
		miniXml = currentXml.substring(0, indexOfId);
		openStatementCnt = (miniXml.match(/<statement/g) || []).length;
		closeStatementCnt = (miniXml.match(/statement>/g) || []).length;
		//difference of open/close STATEMENTS is the indentation for the block
		indentationArr[i] = openStatementCnt - closeStatementCnt;
		indentationArr.push(indentationArr[i]);
	}
	indentationArr.splice(i);
	return indentationArr;
};

/**
* Jumps from a block(on the workspace) to a comment(in the comment div) AND
* from a comment(in the comment div) to a block(on the workspace)
*/
Blockly.Accessibility.TreeView.commentOrBlockJump = function(){
	//check - currentNode isn't null AND the activeElement's id is not importExport
	//importExport is a special case for the button
    if(currentNode != null && document.activeElement.id != "importExport") {
    	//jump from comment to block
    	if(document.activeElement.id) {
    		var eleId = document.activeElement.id;//current comment id
    		var blockId = importantBlockArr[eleId].getAttribute('id');
    		Blockly.Accessibility.Navigation.jumpToID(blockId); 
    	}
    	else {
    		//jump from block to comment
    		var highlightedBlock = currentNode;
			for (var i = 0; i < importantBlockArr.length; i++) { 
				//if the current block in importantBlockArr id is the same as the highlighted block id
	    		if(importantBlockArr[i].getAttribute('id') == highlightedBlock.getAttribute('id')) {
	    			document.getElementById(i).focus(); //give focus to the comment with the id i
	    		}
	    	}
    	}
	}
};
