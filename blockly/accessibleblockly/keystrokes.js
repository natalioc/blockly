'use strict';

/**
* Copyright 2015 RIT Center for Accessibility and Inclusion Research
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

goog.provide('Blockly.Accessibility.Keystrokes');
goog.require('Blockly.Accessibility');
goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility.Prefixes');
goog.require('Blockly.BlockSvg');
goog.require('Blockly.Flyout');
goog.require('Blockly.Accessibility.CursorNavigation');

//default constructor
Blockly.Accessibility.Keystrokes = function(){

}
var map = [];
var keyboardState = 'hotkeyMode';
//Blockly.Accessibility.Keystrokes.prototype.keyboardState = 'hotkeymode';
Blockly.Accessibility.Keystrokes.prototype.isConnecting  = false;
/**
 * When a mouseup event happens, update the XML selection
 */
document.onmouseup = function(e){
	//console.log('Mouse Up');
	Blockly.Accessibility.Navigation.updateXmlSelection();
};


/**
 * Take care of keypresses for accessibility
 */
document.onkeydown = document.onkeyup = function(e){

	e = e || event;
	map[e.keyCode] = e.type == 'keydown';

	if(keyboardState=='typingMode'){ //if you are typing, hotkeys disabled
		if(map[13]){ //Enter
			console.log('Enter key pressed');
			keyboardState = 'hotkeyMode';
			Blockly.selected.comment.setVisible(false);
			Blockly.Accessibility.Navigation.updateXmlSelection();
			Blockly.Accessibility.Prefixes.generateTree();
			e.preventDefault();
			
			
		}
		else if(map[17] && map[67]){ //CTRL C
			console.log('Ctrl C keys pressed');
			keyboardState = 'hotkeyMode';
			Blockly.selected.comment.setVisible(false);
			Blockly.Accessibility.Navigation.updateXmlSelection();
			Blockly.Accessibility.Prefixes.generateTree();
			e.preventDefault();
		
		}
		return;
	}

//===========================================EDITING BLOCKS=======================================
	else if(keyboardState=='editMode'){ //if you are in editMode, normal hotkeys are disabled
		console.log("edit mode");
		if(map[27]){ //Escape
			keyboardState = 'hotkeyMode';
			var highlight = Blockly.Accessibility.InBlock.storedHighlight;
            Blockly.Connection.removeHighlight(highlight);
    		Blockly.Accessibility.InBlock.clearHighlights();
			Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}

		else if(map[65]){ //A
			//Navigate to previous field
			console.log('editMode A key pressed');
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[68]){ //D
			//Navigate to next field
			console.log('editMode D key pressed');
			Blockly.Accessibility.InBlock.selectNext();

		}

		else if(map[87]){ //W
			//Navigate to previous field
			console.log('editMode W key pressed');
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[83]){ //S
			//Navigate to next field
			console.log('editMode S key pressed');
			Blockly.Accessibility.InBlock.selectNext();

		}

		else if (map[69]) { //E
			Blockly.Accessibility.Speech.Say("Edit Mode exited now");
		    Blockly.Accessibility.InBlock.enterSelected();
		    e.preventDefault(); // Prevent default in case this opens up a typing prompt
		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		        keyboardState = 'hotkeyMode'; //prevent getting stuck on same block

		    }
		}

		else if(map[67]){ //C
			console.log('editMode C key pressed');
			Blockly.Accessibility.InBlock.selectConnection();
			Blockly.Accessibility.InBlock.enterCurrentBlock();

		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		    	Blockly.Accessibility.Keystrokes.prototype.isConnecting = true;
		        keyboardState ='hotkeyMode';//prevent getting stuck on same block

		    }
		    //default select the first category in the menu
		    var firstCategory = document.getElementById(":1");
		    firstCategory.focus();

			//keyboardState = 'selectConnectionMode';
		}

		else if(map[13]){ //Enter
			var selList = Blockly.Accessibility.InBlock.selectionList;
			var cIndex  = Blockly.Accessibility.InBlock.connectionsIndex;
			var conName = selList[cIndex].name;

			//dropdown menus
			if(conName == "OP" || conName == "NUM" ){
				Blockly.Accessibility.InBlock.enterSelected();
				keyboardState = 'hotkeyMode';
				Blockly.Accessibility.Speech.Say("Edit Selected");

			}
			//special case needed to blocks with text field followed by a child connection
			else if(conName == "STACK"){ 
				Blockly.Accessibility.InBlock.selectConnection();
				Blockly.Accessibility.Keystrokes.prototype.isConnecting = true;
				keyboardState ='hotkeyMode';//prevent getting stuck on same block
				Blockly.Accessibility.Speech.Say("Connection Selected");

			}
			//everything else
			else{
				Blockly.Accessibility.InBlock.selectConnection();
				Blockly.Accessibility.InBlock.enterCurrentBlock();
				Blockly.Accessibility.InBlock.enterSelected();
				Blockly.Accessibility.Keystrokes.prototype.isConnecting = true;
		    	keyboardState ='hotkeyMode';//prevent getting stuck on same block

		    	Blockly.Accessibility.Speech.Say("Connection Selected");
			}

		    //default select the first category in the menu **debating keeping this or not**
		    //var firstCategory = document.getElementById(":1");
		    //firstCategory.setAttribute("tabIndex", 0);
		   	//firstCategory.focus();
		}
	}


//===========================================CONNECTING BLOCKS====================================================
	else if(keyboardState=='connectBlocksMode'){
		console.log("connecting blocks mode");
		console.log(Blockly.Accessibility.InBlock.enterCurrentBlock());
		if(map[27]){ //Escape
			Blockly.Accessibility.InBlock.clearHighlights();
			keyboardState = 'hotkeyMode';
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}

		else if(map[65]){ //A
			//Navigate to previous field
			console.log('connectBlocksMode A key pressed');
			Blockly.Accessibility.InBlock.selectPrev();
		}

		else if(map[68]){ //D
			//Navigate to next field
			console.log('connectBlocksMode D key pressed');
			Blockly.Accessibility.InBlock.selectNext();
		}

		else if(map[67]){ //C
			Blockly.Accessibility.InBlock.selectConnection();
			keyboardState = 'hotkeyMode';
		}

		else if (map[69]) { //E
		    e.preventDefault(); // Prevent default in case this opens up a typing prompt
		    try { // Try block in case something breaks, we still default back to hotkeymode
		        Blockly.Accessibility.InBlock.enterSelected();
		    }
		    catch (e) {
		        console.log(e);
		    } finally {
		        Blockly.Accessibility.InBlock.clearHighlights();
		        keyboardState = 'hotkeyMode'; //prevent getting stuck on same block
		    }
		}

	}

//===========================================NORMAL HOTKEYS=======================================
	else if(keyboardState=='hotkeyMode'){

	    if (map[17] && map[89]) { //Ctrl Y
	        console.log('Ctrl Y keys pressed');
	        Blockly.Accessibility.Navigation.redo();
	        e.preventDefault();
	    }

	    else if (map[17] && map[90]) { //Ctrl Z
	        console.log('Ctrl Z keys pressed');
	        Blockly.Accessibility.Navigation.undo();
	        e.preventDefault();
	    }
	    else if(map[18] && map[16] && map[67]){ //Alt Shift C
			console.log('Alt Shift C keys pressed.');
			//Keystroke for collapsing or expanding a block
			Blockly.Accessibility.toggleCollapse();
			e.preventDefault();
		}

		else if(map[18] && map[16] && map[68]){ //Alt Shift D
			console.log('Alt Shift D keys pressed.');
			//Keystroke for enabling or disabling a block
			Blockly.Accessibility.toggleDisable();
			e.preventDefault();
			Blockly.Accessibility.Navigation.updateXmlSelection();
		}

		else if(map[18] && map[16] && map[72]){ //Alt Shift H
			console.log('Alt Shift H keys pressed.');
			Blockly.Accessibility.InBlock.getHelpUrl();			
			e.preventDefault();
			map = [];
		}

		else if(map[18] && map[16] && map[73]){ //Alt Shift I
			console.log('Alt Shift I keys pressed.');
			//Toggle inline in a block
			Blockly.Accessibility.toggleInline();
			e.preventDefault();
		}

		else if(map[16] && map[70]){//shift f
			console.log('shift f keys pressed');
			Blockly.Accessibility.Navigation.inlineBlockTraverseOut();
		}

		else if(map[13]){
			console.log('hotkeyMode Enter key pressed');
			Blockly.Accessibility.InBlock.hideDropDown();
			Blockly.Accessibility.CursorNavigation.initialize();
		}

		else if(map[8]){
			var containers = Blockly.Accessibility.MenuNav.containersArr;

		    for(var i = 0; i < containers.length; i++){
		        if(containers[i] == Blockly.selected){
		            containers.splice(i,1);
		        }
		    }
		}

		else if(map[46]){ //Delete
			console.log('Delete key pressed.');
			//Delete the currently selected item
			Blockly.Accessibility.Navigation.updateXmlSelection();
			e.preventDefault();
		}

		else if(map[27]){ //Escape
			console.log('Escape key pressed.');
			var highlight = Blockly.Accessibility.InBlock.storedHighlight;
            Blockly.Connection.removeHighlight(highlight);

			Blockly.Accessibility.InBlock.clearHighlights();
			document.activeElement.blur();

			document.getElementById("colorOptions").style.display = "none";

			//Get out of the current menu
			e.preventDefault();
		}

		else if(map[9]){//tab 
			if(document.activeElement.className != "colOpts"){
				document.getElementById("colorOptions").style.display = "none";
			} 
		}

		else if(map[65]){ //A
			console.log('hotkeyMode A key pressed');
			if(!Blockly.selected) return;
			if(Blockly.selected.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				console.log('ABOU: traverseOut call in nav A key');
				//Blockly.Accessibility.Navigation.traverseOut();
				Blockly.Accessibility.CursorNavigation.goLeft();
			}
		}

		else if(map[67]){ //C
			//Add a comment
			console.log('hotkeyMode C key pressed');
			Blockly.Accessibility.addComment();
			//Blockly.Accessibility.Prefixes.generateTree();
			keyboardState = 'typingMode';
			e.preventDefault();
		}

		else if(map[68]){ //D
			//Navigate in
			console.log('hotkeyMode D key pressed');
			if(!Blockly.selected) return;
			if(Blockly.selected.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				//Blockly.Accessibility.Navigation.traverseIn();
				Blockly.Accessibility.CursorNavigation.goRight();
			}
		}
		
		/*ABOU: Edit mode disabled because in Google's model, there is no edit mode
		else if(map[69]){ //E
			//Edit block of code or edit comment
			console.log('E key pressed');
			console.log('Edit mode activated!');
			if (Blockly.Accessibility.InBlock.enterCurrentBlock()) { // Returns false if nothing is selected
			    keyboardState = 'editMode';
			    Blockly.Accessibility.Speech.Say("Edit Mode entered now");
			}
		}
		*/
		else if (map[70]) { //F traverse inline blocks
			console.log('hotkeyMode F key pressed');
			//Blockly.Accessibility.Navigation.inlineBlockTraverseIn();
		}


		else if(map[71]){ //G
			//Blockly.Accessibility.TreeView.commentOrBlockJump();
			//Goto the block the comment that is currently selected is from
			//Alternatively goto the comment that is connected to the currently selected block
		}

		else if(map[74]){//J jump into workspace or top block of workspace
  
			// var topBlocks = Blockly.Accessibility.MenuNav.containersArr;
            
			// if(topBlocks.length>0){
			// 	topBlocks[0].select();
			// }
			console.log(">>>: J key pressed")
			var topBlocks = Blockly.Accessibility.MenuNav.containersArr;
            // Blockly.Accessibility.MenuNav.containersArr is populated only 
            // when blocks at added to workspace using the keyboard


			if(topBlocks.length <= 0){//handle case when blocks at added using mouse or preloaded from file
				topBlocks = Blockly.mainWorkspace.getTopBlocks(false);

			}
			topBlocks[0].select();
			Blockly.Accessibility.Speech.updateBlockReader(Blockly.selected.type, Blockly.selected);

		}

		else if(map[78]){ //N
			Blockly.Accessibility.Prefixes.getInfoBox();//currently placed here until button is found to hide and show the infobox
			//Initiate a navigate search function
		}

		else if(map[82]){ //R
			//Jumps to the top of the currently selected container
			//Blockly.Accessibility.Navigation.jumpToTopOfSection();
			Blockly.Accessibility.Prefixes.formatTreeView();
			Blockly.Accessibility.Prefixes.infoBoxFill(Blockly.selected);
		}

		else if(map[83]){ //S
			// e.preventDefault();
			console.log('hotkeyMode S key pressed');
			var role = document.activeElement.getAttribute("role");

			if(!Blockly.selected) return;
	
			else if(role == "menu"){
				Blockly.Accessibility.InBlock.ddNavDown();
			}
			
			//if not on toolbox navigate down through blocks
			else if(document.activeElement.id[0] != ":"  && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){
				//Blockly.Accessibility.Navigation.traverseDown();
				Blockly.Accessibility.CursorNavigation.goDown();
				//Blockly.Accessibility.CursorNavigation.goDown();
			}
		
		}

		else if(map[87]){ //W
			console.log('hotkeyMode W key pressed');
			// e.preventDefault();
			var role = document.activeElement.getAttribute("role");

			//if not on the toolbox navigate up through blocks
		    if(!Blockly.selected) return;

			//change option on the block
			else if(role == "menu"){
				Blockly.Accessibility.InBlock.ddNavUp();
			}

			else if(document.activeElement.id[0] != ":" && !Blockly.Accessibility.Keystrokes.prototype.isConnecting){

				//Blockly.Accessibility.Navigation.traverseUp();
				//console.log("Abou: selected" + Blockly.selected.nextConnection);
				//console.log("Abou: currentNode" + Blockly.Accessibility.Navigation.currentNode.nodeName);
				
				//Blockly.selected.nextConnection.returnHighlight()
				Blockly.Accessibility.CursorNavigation.goUp();
				
			}

		}

		//============Jumping to specific category using number keys===============
		else{

			//stop jumping to menu when typing a comment
			if(Blockly.selected.comment.isVisible()){
				keyboardState = "typingMode";
				return;
			}
			//loop through the numbers on keyboard to access menu
			for(var i = 48; i < 57; i++){

				var category;
				//map each number to its key
			    if(map[i]){

					var count = i % 48;

					//9 has different id name
					if(count == 9){
						category = document.getElementById(":a");
					}

					else{
						var tempName = ":" + (count);
						category = document.getElementById(tempName);
					}
					category.focus();
					count++;
				}
			}
		}
	}
};
//==========================================================OVERWRITES================================================================
/*
{OVERWRITE}
need avoid calling hotkeys while typing in text input
*/
Blockly.FieldTextInput.prototype.onHtmlInputKeyDown_ = function(e) {
  keyboardState = "typingMode";
  
  var htmlInput = Blockly.FieldTextInput.htmlInput_;
  var enterKey = 13, escKey = 27;

  if (e.keyCode == enterKey) {
    Blockly.WidgetDiv.hide();
  } 

  else if (e.keyCode == escKey) {
    this.setText(htmlInput.defaultValue);
    document.activeElement.blur();
    Blockly.WidgetDiv.hide();
  }

};

/**
 * Close the editor, save the results, and dispose of the editable
 * text field's elements.
 * @return {!Function} Closure to call on destruction of the WidgetDiv.
 * @private
 */
Blockly.FieldTextInput.prototype.widgetDispose_ = function() {
  keyboardState = "hotkeyMode";

  var thisField = this;
  return function() {
    var htmlInput = Blockly.FieldTextInput.htmlInput_;
    // Save the edit (if it validates).
    var text = htmlInput.value;
    if (thisField.sourceBlock_ && thisField.changeHandler_) {
      var text1 = thisField.changeHandler_(text);
      if (text1 === null) {
        // Invalid edit.
        text = htmlInput.defaultValue;
      } else if (text1 !== undefined) {
        // Change handler has changed the text.
        text = text1;
      }
    }
    thisField.setText(text);
    thisField.sourceBlock_.rendered && thisField.sourceBlock_.render();
    Blockly.unbindEvent_(htmlInput.onKeyDownWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyUpWrapper_);
    Blockly.unbindEvent_(htmlInput.onKeyPressWrapper_);
    Blockly.unbindEvent_(htmlInput.onWorkspaceChangeWrapper_);
    Blockly.FieldTextInput.htmlInput_ = null;
    // Delete style properties.
    var style = Blockly.WidgetDiv.DIV.style;
    style.width = 'auto';
    style.height = 'auto';
    style.fontSize = '';
  };
};