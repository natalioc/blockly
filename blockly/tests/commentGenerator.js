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
 * @author Amber Libby, Alex Bowen, Mary Costa
 */

/**
 * gets all of the blocks that aren't conditionals and calls get indent on the array list it generates
 */
var perfectArr = [];
var prefixArr = [];
var parentArr = [];
T.soundfont.preload(41,42,43,44,45);
var play=false;
var noteLength=600;
var doneTalking=true;
var speedPlay;

function getImportantBlocks(){
	//check if the workspace is empty
	if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
		console.log("nothings here");
        return null;
    }
    //add all blocks to the blockArr
    var blockArr = xmlDoc.getElementsByTagName('BLOCK');

    perfectArr = [];

    //adding any blocks which can stand on their own to perfectArr
    for(var i=0; i < blockArr.length; i++){

		var strType = blockArr[i].getAttribute('type');

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
		else{
			
		}

    }//end of for

    getIndent(perfectArr);


}//end of getImportantBlocks

/**
 * gets how deeply indented all the provided blocks are and passes that array into 
 * the commentPrefix along with the perfectArr
 * @param {perfectArr} array of blocks that we are checking their indentation
 */
function getIndent(perfectArr){

	//the string format of the current XML Doc
	var currentXml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
	
	var openStatementCnt;
	var closeStatementCnt;
	var indexOfId;
	var idOfBlock;
	var miniXml;
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
	createComments(perfectArr, parentArr);

}

/**
 * based on how the comments are placed this will generate their prefixes correctly to display them
 * in the proper order based on their indentation depth.
 * @param {perfectArr, parentArr} perfectArr is the array of blocks that potentially have comments
 * while parentArr is an array that tracks how deeply nested the blocks are.
 * @return {prefixArr} An array of the prefixes built for each block indent
 */
function commentPrefix(perfectArr, parentArr){
	var zeroCount = 1;
    var allCount = 0;
    var prefixStringPrev;
    prefixArr = [];

    for (var i = 0; i < parentArr.length; i++) {

        if(parentArr[i].toString() == "0"){
            prefixArr[i] = "C" + zeroCount.toString();
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
}

/**
 * Generates the comments and places them into the div in the HTML to display the comments on the page
 * with the right format of prefixes. It puts all the comment blocks into <p> tags so they properly
 * display on the web.
 * @param {perfectArr, parentArr} perfectArr is the array of blocks that potentially have comments
 * while parentArr is an array that tracks how deeply nested the blocks are.
 */
function createComments(perfectArr, parentArr){
  //clears the comment div of old data
  document.getElementById("comment").innerHTML = "";

  var pTag;
  var commentStr;
  var prefixes = commentPrefix(perfectArr, parentArr);
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
  
}
/**
* Uses the currently selected comment to jump to the
* block with the corresponding id.
*/
function commentOrBlockJump(){
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
    else {

    }
}

function infoBoxFill(currentNode){
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
}


/**
* Function that takes in the current node, gets its id attribute, finds the element's position
* in the perfectArr array, and uses that position to identify the current node's level
* of nesting in the parentArr array and returns it as a normal voice.
* @param the current node that is selected
* Added by: Wil Merchant (6/26/15)
*/
function nestLevel(currentNode){
    if(currentNode!=null){
        var speakLevel="Level ";
        var addition="";
        var arrLength = perfectArr.length; //The length of the parentArr and perfectArr arrays
        for (var i = 0; i < arrLength; i++) {
            if(currentNode.getAttribute('id') == perfectArr[i].getAttribute('id')){
               var nestInfo = prefixArr[i].substring(1);
               var nestArray = nestInfo.split(".");//removes all "." gotten from prefix Arr
               for(var j=0;j<nestArray.length;j++){
                    if(j<nestArray.length-1){
                        speakLevel+=nestArray[j];//puts all levels together in a single array
                        speakLevel+=" point ";
                    }
                    else{
                        speakLevel+=nestArray[j];
                    }
                }
                while(responsiveVoice.isPlaying())//cancels voice to preent program from talking over itself
                    responsiveVoice.cancel();
                responsiveVoice.speak(speakLevel);
                break;
            }
        }
    }
}; 
/**
* Function that takes in the current node, gets its id attribute, finds the element's position
* in the perfectArr array, and uses that position to identify the current node's level
* of nesting in the parentArr array and returns it as a spearcon.
* @param the current node that is being selected
*/
function spearNestLevel(currentNode){
    meSpeak.stop();//prevents any current spearcons from playing
    if(currentNode!=null){
        var speakLevel="Level ";
        var addition="";
        var arrLength = perfectArr.length; //The length of the parentArr and perfectArr arrays
        for (var i = 0; i < arrLength; i++) {
            if(currentNode.getAttribute('id') == perfectArr[i].getAttribute('id')){
                var nestInfo = prefixArr[i].substring(1);
                var nestArray = nestInfo.split(".");//removes the decimals from the commented level
                for(var j=0;j<nestArray.length;j++){
                    if(j<nestArray.length-1){
                        speakLevel+=nestArray[j];//adds enteire level to array
                        speakLevel+=" point ";
                    }
                    else{
                        speakLevel+=nestArray[j];
                    }
                }
                doneTalking=false;
                meSpeak.speak(speakLevel, {speed: 600},meSpeakDone);//says spearcon and jumps to other function for timeout to work properly
                break;
            }
        }
    }
};
/**
* Function that takes in the current node, gets its id attribute, finds the element's position
* in the perfectArr array, and uses that position to identify the current node's level
* of nesting in the parentArr array and returns it as an earcon by playing individual notes.
* @param The current node that is selected
*/
function earNestLevel(currentNode){
    if(currentNode!=null){
        play=false;//stops and current notes from playing
        noteLength=0;
        var speakLevel="";
        var arrLength = perfectArr.length; //The length of the parentArr and perfectArr arrays
        for (var i = 0; i < arrLength; i++) {
            if(currentNode.getAttribute('id') === perfectArr[i].getAttribute('id')){
                var nestInfo = prefixArr[i].substring(1);
                var initialArray = nestInfo.split(".");//removes decimals from current level
                var nestArray=[];
                for(var j=0;j<initialArray.length;j++){
                    for(var k=0;k<initialArray[j];k++){
                        nestArray.push(initialArray[j]);//adds the level to a single variable
                    }
                    nestArray.push("-1");
                }
                for(var j=0;j<nestArray.length;j++){
                    //changes the vales in the nest array so that they'll actually play midi files in accordance with the timbre function
                    //all of the notes are changed so that the higher the level the value that is passed in, the higher the pitch of the 
                    //note will sound. Eg. 43 will play a higher pitched sound than 41. -1 represent where a "." was and treats it as a 
                    //break in the level of the notes
                    switch (nestArray[j])
                    {
                        case "-1": nestArray[j]=-1; break;
                        case "1": nestArray[j]=41;break;
                        case "2": nestArray[j]=42;break;
                        case "3": nestArray[j]=43;break;
                        case "4": nestArray[j]=44;break;
                        case "5": nestArray[j]=45;break;
                        default: nestArray[j]=73;break;
                    }
                } 
                var tempNotes=[];
                for(var j=0;j<nestArray.length;j++){
                //stores all similar notes in array so that similar notes will played at once at a simalar speed. Eg. If the array contains
                //42,42,43; the two 42 will passed into playnotes
                    if(nestArray[j]===-1){
                        var speed=tempNotes.length;//the length of the notes will shorten as the number of notes increase
                        T.soundfont.preload(tempNotes);//preloads notes to play to increase quality
                        playNotes(tempNotes,speed);//plays notes that are all currently stored in the array
                        tempNotes=[];//emptys array so that new notes can be pused in
                    }
                    else{
                        tempNotes.push(nestArray[j]);
                        noteLength+=560;//increases notelength to create a system where notes don't run over each other.
                    }
                }
                break;
            }
        }
    }
};
/**
* Plays all notes that are passed into the function one a time with a short pause after each notes played
* @param noteToPlay: The array of notes to be played.
* @param speed: The number of notes in the array of notes passed in
*/
//var t;
function playNotes(noteToPlay,speed){
    if(play===true){//times itself out and calls itself until current notes are done playing.
        setTimeout(function() {
            playNotes(noteToPlay,speed);
        }, 400);
        return;3
    }3
    //if(t)3
      //  t.stop();3
    var i=0;
    var toggle = false;//toggle is used to aid in the notes not running over each other
    var newSpeed=540/speed;//Sets how fast the notes will be played.
    play=true;//lets the program know that music is currently playing
    //this function essentially works like a for loop
    t = T("interval", {interval:newSpeed,timeout:"55sec"},function(){
        if(i>noteToPlay.length-1||noteToPlay[i]===undefined||play===false){
            this.stop();//stops when no more valid notes can be found or program tells function to stop playing notes
            play=false;
        }
        if(!toggle){
            if(!noteToPlay[i]){
                this.stop();//stops any notes from playing no more valid notes are passed in
                play = false;
            }
            T.soundfont.play(noteToPlay[i]);//plays a single note at a time to prevent the notes from playing over each other.
            i++;
            toggle = !toggle;
        }
        else{
            toggle = !toggle;
        }
    }).on("ended",function(){
        this.stop();
        play=false;
    }).start();
    return;
};
/**
* lists the xml code and IDs of the current entire selection that is currently highlighted. Useful to know
* exact code of the blocks
*/
function blockLister(){
    //check if the workspace is empty
    if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        console.log("nothings here");
        return null;
    }
    //add all blocks to the blockArr
    var blockList = xmlDoc.getElementsByTagName('BLOCK');
    var listLen = blockList.length;
    var idList = [];
    window.alert(listLen);
    for(var i = 0; i<listLen; i++){
        idList[i] = blockList[i].getAttribute('type');
     };
     var parArrLen = parentArr.length;
     window.alert(parentArr);
     //gets the current XML
    var currentXml = Blockly.Xml.domToPrettyText(Blockly.Xml.workspaceToDom(Blockly.mainWorkspace));
    window.alert(currentXml);
}//end of getImportantBlocks
/**
* This function stores the text that is used in the audio that is read by the screen reader. The text that is read changes depending on
* what type of audio cue the user currently has selected. Indentation are used to determine when audio cues are played as audio cues will
* only play when the level of nesting of the function changes.
*/
function codeReader(){
    var levelReader=audioSelection;
    var array = [];//stores array of letters to be played
    var indent=[]; //stores indentation of level to be played.
    if(levelReader==="normal"){
        array = ["variable i equals 3","variable j equals 5",/*"if i plus j equals 8","print i plus j",*/"while i is less than 10","if i is less than 5","increment i by 1","else","increment i by 2","print i plus j"];
        indent= [1,-1,-1,2,3,2,3,1];
    }
    else if(levelReader==="ear con"){
        array = ["variable sum equals 0","variable x equals 0","while x less than 10","increase x by 1","if x is divisible by 3","increase x by 2","increase sum by x","print x","print sum"];    
        indent = [1,-1,-1,2,-1,3,2,-1,1];
    }
    else if(levelReader==="spear con"){
        array = ["variable x equals 2","variable y equals 2","variable num equals 1","while num less than 10","print num","increase num by 2","if x greater than 0","print x","else","print y","print num"," "];
        indent = [1,-1,-1,-1,2,-1,-1,3,2,3,2,1];
    }
    var i=0;
    speedPlay=300;//how long a pause will be given to each of the notes
    for(i;i<array.length;i++){
        looped(i,array,levelReader,indent,speedPlay);//a loop function which will be basically each part of the text one at a time.
    }
};
/**
* This function stores the text that is used in the audio that is read by the screen reader. The text that is read changes depending on
* what type of audio cue the user currently has selected. Indentation are used to determine when audio cues are played as audio cues will
* only play when the level of nesting of the function changes.
*/
function codeReaderTrial(){
    var levelReader=audioSelection;
    var array = [];//the text that will be read for trial 2 of the experiment
    var indent=[];//the indentation level of the text that will be played
    var array = ["variable count equals 1.", " variable y equals 6.", "while count less than 6", "increase y by 1", "increase count by 1", "print y." ];
    var indent = [1,-1,-1,2,-1,1];
    var i=0;
    speedPlay=300;
    for(i;i<array.length;i++){
        looped(i,array,levelReader,indent,speedPlay);
    }
};
/**
* This function loops through the text array and plays each index of the array one at a time. It calls the correct audio cue 
* to play accordingly
* @param i: the counter for the array to track what index the array is at.
* @param array: the array of text that will be read by resposive voice
* @param levelReader: The current audio that has been selected by the user
* @param indent: An array that holds the indent level of the current text.
* @param speedPlay: The length of the pause for the earcon
*/
function looped(i,array,levelReader,indent,speedPlay){
    if(indent[i]!=-1){
        if(levelReader==="normal") 
           playStringNormal(indent[i]);
        else if(levelReader==="spear con")
            playStringSpear(indent[i]);
        else if(levelReader==="ear con")
            speedPlay=playStringEar(indent[i],speedPlay);
    }
    playString(array[i],speedPlay);//will read the index of the text passed in
}
/**
* This function reads the text that is passed in by the array of text. It makes sure to stop any other audio before playing.
* @param text: The text that responsive voice will play after the level is played
* @speedPlay: The length of the earcon that will be played
*/
function playString(text,speedPlay){
    if(responsiveVoice.isPlaying()===true||play===true||doneTalking===false){//sets timeout to give 
        if(audioSelection==="ear con")
            setTimeout(function(){playString(text,speedPlay);},2000)
        else
            setTimeout(function() {playString(text,speedPlay);}, 100);
       return;
    }
    else{
        pausecomp(2000);
        responsiveVoice.speak(text);
        return;
    }
};
/**
* This function reads the level of the function being read in the code reader in the form of normal speech
* @param indent: the indentation level that will be read by the program.
*/
function playStringNormal(indent){
    if(responsiveVoice.isPlaying()===true){
       setTimeout(function() {playStringNormal(indent);}, 100);
       return;
    }
    else{
        pausecomp(2000);//gives 2 second pause to give listener time to react to what they heard
        var normalText="Level "+indent;
        responsiveVoice.speak(normalText);//reads the level of the current block.
        return;
    }
};
/**
* This function reads the level of the function being read in the code reader in the form of a earcon.
* @param indent: the indentation level that will be read by the program.
* @param speedPlay: The length of the pause given by the earcon.
* @return speedPlay: Returns the length of time to wait for the earcon to finish playing.
*/

//see comments for line 393 function to understand how this function works.
function playStringEar(indent,speedPlay){
    if(responsiveVoice.isPlaying()===true||play===true){
        console.log(play);
       setTimeout(function() {playStringEar(indent);}, 2000);
       return;
    }
    else{
        var instrument=[];
        for (var j=0;j<indent;j++)
            instrument.push(indent);
        for (var j=0;j<instrument.length;j++){
            switch(instrument[j]){
                case 1: instrument[j]=41;break;
                case 2: instrument[j]=42;break;
                case 3: instrument[j]=43;break;
                case 4: instrument[j]=44;break;
                case 5: instrument[j]=45;break;
                default: instrument[j]=73;break;
            }
        }
        var normalText="Level "+indent;
        var j=0;
        var toggle = false;
        var newSpeed=540/indent;
        noteLength=instrument.length*560;
        speedPlay=indent*560;
        T.soundfont.preload(instrument);
        play=true;
        var t = T("interval", {interval:newSpeed,timeout:"55sec"},function(){
            if(j>instrument.length-1||instrument[j]===undefined){
                this.stop();
                play=false;
            }
            if(!toggle){
                if(!instrument[j]){
                    this.stop();
                    play=false;
                }
                T.soundfont.play(instrument[j]);
                j++;
                toggle = !toggle;
            }
            else{
                toggle = !toggle;
            }
        }).on("ended",function(){
            this.stop();
            play=false;
        }).start();
        return speedPlay;
    }
};
/**
* This function reads the level of the function being read in the code reader in the form of a spearcon.
* @param indent: the indentation level that will be read by the program.
*/
function playStringSpear(indent){
    if(responsiveVoice.isPlaying()===true||doneTalking===false){
       setTimeout(function() {playStringSpear(indent);}, 100);
       return;
    }
    else{
        pausecomp(2000);//puts a 2 second pause for the second trial that will give the listener time to react to what they are listening to.
        doneTalking=false;
        var normalText="Level "+indent;
        meSpeak.speak(normalText, {speed: 600},meSpeakDone);//reads the level in a sped up fashion.
        return;
    }
};

/**
* This function is set as a workaround function for the settimeout function for spearcons. It only servers to let the program know that
* the program is done using spearcons.
*/
function meSpeakDone(){
    doneTalking=true;
}
/**
* This function will stop program execution for the given amount of time as put in. While this is a terrible javscript practive, this function
* was needed to incorporate reliable pauses into the program without the use of jquery. If possible, I would highly suggest incorporating 
* jquery into this program to making timing run a lot smoother.
* @param ms: The variable will cause the program to pause for the given amount of time in milliseconds
*/
function pausecomp(ms) {
    ms += new Date().getTime();
    while (new Date() < ms){;}
} 