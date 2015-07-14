'use strict';

var numberOfBlocks=0;

/**
*Copyright [2015] [Rachael Bosley, Luna Meier]
*
*Licensed under the Apache License, Version 2.0 (the "License");
*you may not use this file except in compliance with the License.
*You may obtain a copy of the License at
*
*    http://www.apache.org/licenses/LICENSE-2.0
*
*Unless required by applicable law or agreed to in writing, software
*distributed under the License is distributed on an "AS IS" BASIS,
*WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
*See the License for the specific language governing permissions and
*limitations under the License.
*/
goog.require('Blockly.Blocks');
goog.require('Blockly.WorkspaceSvg');
goog.require('Blockly.Workspace');
//goog.require('meSpeak');
//var meSpeak=require("mespeak");


var map = [];
var keyboardState = 'hotkeyMode';
meSpeak.loadConfig("mespeak_config.json");
meSpeak.loadVoice("voices/en/en-us.json");
var speedSpeak = 175;
//var audioSelection = 'normal';
responsiveVoice.setDefaultVoice("US English Female");
var quickSelect=false;
// ['normal','ear con','spear con'];
/*var codeSelection = [1,2,3];

//audioSelection=shuffle(audioSelection);
codeSelection=shuffle(codeSelection);

window.alert(audioSelection);
window.alert(codeSelection);

function shuffle(array) {
  var currentIndex = array.length, temporaryValue, randomIndex ;

  // While there remain elements to shuffle...
  while (0 !== currentIndex) {

    // Pick a remaining element...
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex -= 1;

    // And swap it with the current element.
    temporaryValue = array[currentIndex];
    array[currentIndex] = array[randomIndex];
    array[randomIndex] = temporaryValue;
  }

  return array;
}
*/



/**
 * When a mouseup event happens, update the XML selection
 */
document.onmouseup = function(e){
	console.log('Mouse Up');
	updateXmlSelection();
};

/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = document.onkeyup = function(e){
	
	e = e || event;
	map[e.keyCode] = e.type == 'keydown';	
	
	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		if(map[13]){ //Enter
			console.log('Enter key pressed.');
			keyboardState = 'hotkeyMode';
			updateXmlSelection();
		}
		return;
	}	

	if(keyboardState=='menuMode'){ //within the category select menu
		if(map[49]){ //1 
			console.log("Within A menu, 1 key pressed.");
			//Enter the first list
			keyboardState='menuKeyOne';
		}
		if(map[50]){ //2
			console.log("Within A menu, 2 key pressed.");
			//Enter the second list
			keyboardState='menuKeyTwo';
		}
		if(map[51]){ //3
			console.log("Within A menu, 3 key pressed.");
			//Enter the third list
			keyboardState='menuKeyThree';
		}
		if(map[52]){ //4
			console.log("Within A menu, 4 key pressed.");
			//Enter the fourth list
			keyboardState='menuKeyFour';
		}
		if(map[53]){ //5
			console.log("Within A menu, 5 key pressed.");
			//Enter the fifth list
			keyboardState='menuKeyFive';
		}
		if(map[54]){ //6
			console.log("Within A menu, 6 key pressed.");
			//Enter the sixth list
			keyboardState='menuKeySix';
		}
		if(map[55]){ //7
			console.log("Within A menu, 7 key pressed.");
			//Enter the seventh list
			keyboardState='menuKeySeven';
		}
		if(map[56]){ //8
			console.log("Within A menu, 8 key pressed.");
			//Enter the eighth list
			keyboardState='menuKeyEight';
		}
		//If another block category is added, add it down here
	}

	if(keyboardState=='hotkeyMode'){	
		if (map[17] && map[90]){ //Ctrl Z
			console.log("Control Z pressed.");
		    //Need to implement Undo
			undo();
			e.preventDefault();
		}
		
		else if(map[17] && map[89]){ //Ctrl Y
			console.log("Control Y pressed.");
		    //Need to implement Redo
			redo();
			e.preventDefault();
		}
		
		else if(map[9] && map[16]){ //Tab Shift
			console.log("Tab Shift pressed.");
			e.preventDefault();
			//Go backwards through the same level of code
		}
		
		else if(map[9]){ //Tab
			console.log("Tab key pressed.");
			//Go through the same level of code
		}
			
		else if(map[188]){ //Comma
			console.log("Comma key pressed.");
			//Traverse forward within a block with fields
		}
		
		else if(map[190]){ //Period
			console.log("Period key pressed.");
			//Traverse backward within a block with fields
		}
		
		else if(map[46]){ //Delete
			console.log("Delete key pressed.");
			//Delete the currently selected item
			updateXmlSelection();
			e.preventDefault();
		}
		
		else if(map[27]){ //Escape
			console.log("Escape key pressed.");
			//Get out of the current menu
			e.preventDefault();
		}
		
		else if(map[77]){ //M
			console.log("M key pressed.");
			//This should initiate menu mode
			//This should initiate a menu to add a block using hotkeys
			keyboardState='menuMode';	
		}
		
		else if(map[67]){ //C
			//Add a comment
			console.log("C key pressed.");
			addComment();
		}
		
		else if(map[69]){ //E
			console.log("E key pressed.");
			getImportantBlocks();
			//Edit block of code or edit comment
		}
		
		else if(map[71]){ //G
			console.log("G key pressed.");
			commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}
		/*
		else if(map[72]){ //H
			console.log("H key pressed.");
			helpSelectedBlock();
			//Link to the help page for the selected block
		}*/
		
		else if(map[78]){ //N
			console.log("N key pressed.");
			//Initiate a navigate search function
		}
		
		else if(map[79]){ //O
			console.log("O key pressed.");
			//Trial variable for collapsing or expanding a block
			toggleCollapse();
		}
		
		else if(map[80]){ //P
			console.log("P key pressed.");
			//Trial variable for enabling or disabling a block
			toggleDisable();
			updateXmlSelection();
		}
		
		else if(map[81]){ //Q
			console.log("Q key pressed.");
			//Trial variable for duplicating a block
			duplicateSelected();
			updateXmlSelection();
		}
		
		else if(map[82]){ //R
			//Jumps to the top of the currently selected container
			console.log("R key pressed.");
			jumpToTopOfSection();
		}
		
	/*	else if(map[13]){ //Enter
			console.log('Enter key pressed.');
			updateXmlSelection();
		}*/
		
		//Arrow keys for development purposes.  Switch as needed for proper usage.
		
		else if(map[37] || map[65]){ //left arrow or A
			traverseOut();
		}
		
		else if(map[38] || map[87]){ //up arrow or W
			traverseUp();
		}
		
		else if(map[39] || map[68]){ //right arrow or D
			traverseIn();
		}
		
		else if(map[40] || map[83]){ //down arrow or S
			traverseDown();    
		}

		else if(map[84]){//t
			speakAudio(speedSpeak);
		}
		else if(map[89]){//y
			try{
			if(audioSelection==='normal')
				nestLevel(getCurrentNode(),speedSpeak);
			else if(audioSelection==='ear con')
				earNestLevel(getCurrentNode());
			else if(audioSelection==='spear con')
				spearNestLevel(getCurrentNode());
			}
			catch(err){
				window.alert(err+err.lineNumber);
			}
		}
		else if(map[90]){//z
			question1(1);
			updateXmlSelection();
			var blockArr = xmlDoc.getElementsByTagName('BLOCK');
			var firstBlock=blockArr[0].getAttribute('ID');
			jumpToID(firstBlock);
			quickSelect=true;
		}
		else if(map[88]){//x
			if(audioSelection==="normal")
				question4(1);
			else if(audioSelection==="ear con")
				question5(1);
			else{
				question6(1);
			}
			responsiveVoice.speak("Root Block Selected");
			updateXmlSelection();
			var blockArr = xmlDoc.getElementsByTagName('BLOCK');
			var firstBlock=blockArr[0].getAttribute('ID');
			jumpToID(firstBlock);
		}

		else if(map[61]){ //+
			speedSpeak+=20;
		}
		else if(map[173]){//-
			speedSpeak-=20;
		}

		else if(map[45]){//insert
			switch(audioSelection)
			{
				case 'normal':
					audioSelection='ear con';
					break;
				case 'ear con':
					audioSelection='spear con';
					break;
				case 'spear con':
					audioSelection='normal';
					break;
				default:
					break;
			}
			responsiveVoice.speak(audioSelection);
		}
		else if (map[73]){//i
			codeReader();
		}

		else if(map[74]){ //J 
			blockLister();
		}	
		
		else if(map[86])//v
		{
			responsiveVoice.speak("Root Block Selected");
			updateXmlSelection();
			var blockArr = xmlDoc.getElementsByTagName('BLOCK');
			var firstBlock=blockArr[0].getAttribute('ID');
			jumpToID(firstBlock);
		}

		else if(map[70]){//f
    		var children = currentNode.childNodes;
   			for (var i = 0; i < children.length; i++) {
        		if (children[i].nodeName.toUpperCase() == 'STATEMENT') {
        			responsiveVoice.speak("Lower level detected.");
			//jumpToBottomOfSection();
				}
			}
		}


		else if(map[13]){ //Enter
           // window.alert(getCurrentNode().id)
            if(quickSelect===true){
            	if((getCurrentNode().id)==="19"){
                    responsiveVoice.speak("Correct!");
                    startTimer();
                    window.alert(realTime);
                    window.alert(realTime);
                }
                else{
                    responsiveVoice.speak("Wrong!");
                }
            }
            else if(audioSelection==="normal"){
                if((getCurrentNode().id)==="13"){
                    responsiveVoice.speak("Correct!");
                    startTimer();
                    window.alert(realTime);
                    window.alert(realTime);

                }
                else{
                    responsiveVoice.speak("Wrong!");
                }
            }
            else if(audioSelection==="ear con"){
                if((getCurrentNode().id)==="15"){
                    responsiveVoice.speak("Correct!");

                    window.alert(realTime);
                    window.alert(realTime);
                }
                else{
                    responsiveVoice.speak("Wrong!");
                }
            }
            else if(audioSelection==="spear con"){


                if((getCurrentNode().id)==="16"){
                    responsiveVoice.speak("Correct!");
                    window.alert(realTime);
                    window.alert(realTime);
                }
                else{
                    responsiveVoice.speak("Wrong!");
                }
            }

        }

	}
};