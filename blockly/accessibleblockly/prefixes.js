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

	this.displayComments();
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
			sectionStr = "Section: " + sectionStr.substring(0, 	2);//get the first char from the prefix 
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
 * @return {map} a hashmap of all the blocks id's and their associated prefix's
 */
Blockly.Accessibility.Prefixes.getAllPrefixes = function() {
	//Check if the workspace is empty
	if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }
    //Add all xml blocks to blockArr 
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
				oldPrefix = map[previousParentValue.getAttribute('id')];
				oldPrefix = oldPrefix + this.getAlphabetical(lowerAlphabet);
				map[valueArr[i].getAttribute('id').toString()] = oldPrefix;
				lowerAlphabet++;
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

