'use strict';

/**
*Copyright 2015 RIT Center for Accessibility and Inclusion Research
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

/**
 * @fileoverview Provides ability to navigate within a block in order to access inner blocks and fields.
 */

goog.provide('Blockly.Accessibility.InBlock');
<<<<<<< HEAD
goog.require('Blockly.Block');
=======

>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility.Speech');
goog.require('Blockly.Accessibility.Keystrokes');
goog.require('Blockly.Accessibility');

Blockly.Accessibility.InBlock.storedConnection = null;
/**
 * Contains the array that describes whether the selected block has values, fields, or statements.
 */
Blockly.Accessibility.InBlock.selectionList = [];

/**
 * Contains the index of the currently selected value, field, or statement
 */
Blockly.Accessibility.InBlock.connectionsIndex = 0;

/**
 * Initializes all the information necessary to access a block. 
 * Creates selectionList, which can be navigated to deal with the block
 * @return {bool} Returns true if success, returns false if failure to enter block
 */
Blockly.Accessibility.InBlock.enterCurrentBlock = function () {

    if (!Blockly.selected) {
        return false;
    }

    if (this.selectionList != []) {
        this.clearHighlights();
    }

    // Check the bottom and top connections and only add them to the list if it's meaningful to do so.
    this.selectionList = [];
    if (Blockly.selected.nextConnection != null) {
        this.selectionList.push('bottomConnection');
    }

    if (Blockly.selected.previousConnection != null) {
        this.selectionList.push('topConnection');
    }

    // Go through all of the inputs for the current block and see what you can add where
    for (var i = 0; i < Blockly.selected.inputList.length; i++) {
        if (Blockly.selected.inputList[i].fieldRow.length > 0) {
            // Check all of the fields
            for (var j = 0; j < Blockly.selected.inputList[i].fieldRow.length; j++) {
                if (!(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldLabel) &&
                    !(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldImage)) {
                    this.selectionList.push(Blockly.selected.inputList[i].fieldRow[j]);

                }
            }
        }
        // If the connection is null it means nothing can be connected there, so we don't need to remember the input
        if (Blockly.selected.inputList[i].connection != null) {
            this.selectionList.push(Blockly.selected.inputList[i]);
        }
    }

    if (Blockly.selected.outputConnection != null) {
        this.selectionList.push('outputConnection');
    }


    if (this.selectionList.length == 0) {
        return false;
    }

    this.connectionsIndex = 0;

    if(Blockly.Accessibility.Speech.keyboardState == "editMode"){
        Blockly.Accessibility.Speech.readConnection(this.selectionList[this.connectionsIndex].name, this.connectionsIndex);
    }
    this.highlightSelection();

    return true;
};

/**
 * Selects the next value or field within the current block
 */
Blockly.Accessibility.InBlock.selectNext = function () {
    this.unhighlightSelection();

    this.connectionsIndex++;
    if (this.connectionsIndex >= this.selectionList.length) {
        this.connectionsIndex = 0;
    }
    
    Blockly.Accessibility.Speech.readConnection(this.selectionList[this.connectionsIndex].name, this.connectionsIndex);

    this.highlightSelection();

};

/**
 * Selects the previous value or field within the current block
 */
Blockly.Accessibility.InBlock.selectPrev = function () {

    this.unhighlightSelection();

    this.connectionsIndex--;
    if (this.connectionsIndex < 0) {
        this.connectionsIndex = this.selectionList.length - 1;
    }


    Blockly.Accessibility.Speech.readConnection(this.selectionList[this.connectionsIndex].name, this.connectionsIndex);

    this.highlightSelection();

};

/**
 * Selects the current field if a field is selected, or selects
 * the current block if a value or statement is selected
 */
Blockly.Accessibility.InBlock.enterSelected = function () {

    this.clearHighlights();

    //See INNER_ACTION_FUNCTIONS region below for functions
    if (this.selectionList[this.connectionsIndex] === 'bottomConnection') {
        this.bottomConnection();
    }
    else if (this.selectionList[this.connectionsIndex] === 'topConnection') {
        this.topConnection();
    }
    else if (this.selectionList[this.connectionsIndex] === 'outputConnection') {
        this.outputConnection();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.Input) {
        this.input();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldDropdown) {
        this.dropDown();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldTextInput) {
        this.textInput();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldColour) {
        this.colour();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldCheckbox) {
        this.checkbox();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldDate) {
        this.date();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.FieldVariable) {
        this.variable();
    }
};

/**
 * Stores a connection that you will be connecting to, or if a
 * connection is already stored then it connects the two connections.
 */
Blockly.Accessibility.InBlock.selectConnection = function () {

    var relevantConnection = null;

    // First find which case we're dealing with, and get the relevant connection for the case
    if (this.selectionList[this.connectionsIndex] === 'bottomConnection') {
        relevantConnection = Blockly.selected.nextConnection;
    }
    else if (this.selectionList[this.connectionsIndex] === 'topConnection') {
        relevantConnection = Blockly.selected.previousConnection;
    }
    else if (this.selectionList[this.connectionsIndex] === 'outputConnection') {
        relevantConnection = Blockly.selected.outputConnection;
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.Input) {
        relevantConnection = this.selectionList[this.connectionsIndex].connection;
    }

    // If we don't have a stored connection, then store one.  Otherwise connect the things.
    if (this.storedConnection == null) {
        this.storedConnection = relevantConnection;

        //storing
        this.selectionList = [];
        this.storedHighlight = this.storedConnection.returnHighlight();
    }
    else {
        this.safeConnect(relevantConnection);
    }
}

Blockly.Accessibility.InBlock.safeConnect = function(relevantConnection){
    this.storedConnection.unhighlight();
    try {
        this.unhighlightSelection();
        this.storedConnection.connect(relevantConnection);
    }
    catch (e) {

        console.log(e);

        // This error is unlikely to happen.  Pre-checking is probably just going to be
        // a waste of time, so we'll handle it here.
        if (e == 'Source connection already connected (block).' || 'Can only do a mid-stack connection with the top of a block.') {
            if (this.storedConnection.targetConnection != relevantConnection) {
                var lower = this.storedConnection.isSuperior() ? relevantConnection : this.storedConnection;
                lower.sourceBlock_.unplug(false, false);
                try {
                    this.storedConnection.connect(relevantConnection);
                    console.log('Handled previous error, disregard');
                }
                catch (e) {
                    console.log(e);
                }
            }
        }
    }
    finally {
        Blockly.Connection.removeHighlight(this.storedHighlight);
        this.storedHighlight = null;
        this.storedConnection = null;
    }
}

/**
 * Disconnects the currently selected connection.
 */
Blockly.Accessibility.InBlock.disconnectSelection = function () {
    // Find which case we're dealing with, then just disconnect.
    if (this.selectionList[this.connectionsIndex] === 'bottomConnection') {
        Blockly.selected.nextConnection.disconnect();
    }
    else if (this.selectionList[this.connectionsIndex] === 'topConnection') {
        Blockly.selected.previousConnection.disconnect();
    }
    else if (this.selectionList[this.connectionsIndex] === 'outputConnection') {
        Blockly.selected.outputConnection.disconnect();
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.Input) {
        this.selectionList[this.connectionsIndex].connection.disconnect();
    }
}

/**
 * Highlights the currently selected input
 */
Blockly.Accessibility.InBlock.highlightSelection = function(){
    //See INNER_ACTION_FUNCTIONS region below for functions
    if (this.selectionList[this.connectionsIndex] === 'bottomConnection') {
        this.highlightList.push(Blockly.selected.nextConnection.returnHighlight());
    }
    else if (this.selectionList[this.connectionsIndex] === 'topConnection') {
        this.highlightList.push(Blockly.selected.previousConnection.returnHighlight());
    }
    else if (this.selectionList[this.connectionsIndex] === 'outputConnection') {
        this.highlightList.push(Blockly.selected.outputConnection.returnHighlight());
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.Input) {
        this.highlightList.push(this.selectionList[this.connectionsIndex].connection.returnHighlight());
    }
    else if (this.selectionList[this.connectionsIndex] instanceof Blockly.Field) {
        this.highlightList.push(this.selectionList[this.connectionsIndex].highlight());
    }
}

/**
 * Unhighlights the currently selected input
 */
Blockly.Accessibility.InBlock.unhighlightSelection = function () {
    this.clearHighlights();
}

/**
 * If a value or statement is selected, add a block to it.
 */
Blockly.Accessibility.InBlock.addBlock = function () {
    var newBlock;
    Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
    if(this.storedConnection.check_ != null){
        //sometimes get an error when we don't predefine the variable
        var loopDistance = this.storedConnection.check_.length;
        for (var i = 0; i < loopDistance; i++){
            var selectedNode = Blockly.Accessibility.MenuNav.getMenuSelection();
<<<<<<< HEAD
            console.log(this.storedConnection.type);
=======
>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
            if(this.storedConnection.type == 1){
                if(selectedNode.outputConnection.check_[0] == this.storedConnection.check_[i]){
                    newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                    this.safeConnect(newBlock.outputConnection);
                }
            }
            else if(this.storedConnection.type == 2){
                if(selectedNode.inputList[0].connection.check_[0] == this.storedConnection.check_[i]){
                    newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                    this.safeConnect(newBlock.inputList[0].connection);
                }
            }
<<<<<<< HEAD
            else if(this.storedConnection.type == 3){
            	console.log("connection type three");
                if(selectedNode.previousConnection.check_[0] == this.storedConnection.check_[i]){
                    newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                    this.safeConnect(newBlock.previousConnection);
                }
            }
           /* else if(this.storedConnection.type == 4){
            	if(selectedNode.inputList[0].connection.check_[0] == this.storedConnection.check_[i]){
                newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                this.safeConnect(newBlock.nextConnection);
            }
            	}*/
            else{
                console.log("these blocks are not compatable");
              
            }
        }
    }
    //these blocks are compatible because anything can connect to this block
=======
            //these blocks are not compatable
            else{
                console.log("these blocks are not compatable");
            }
        }
    }
    //these blocks are compatable because anything can connect to this block
>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
    else{
        if(this.storedConnection.type == 1){
            newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
            this.safeConnect(newBlock.outputConnection);
        }
        else if(this.storedConnection.type == 2){
            newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
            this.safeConnect(newBlock.inputList[0].connection);
        }
        else if(this.storedConnection.type == 3){
            newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
<<<<<<< HEAD
=======
            console.log(newBlock);
>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
            this.safeConnect(newBlock.previousConnection);
        }
        else if(this.storedConnection.type == 4){
            newBlock = Blockly.Accessibility.MenuNav.flyoutToWorkspace();
            this.safeConnect(newBlock.nextConnection);
        }
    }
    //Blockly.Connection.removeHighlight(this.storedHighlight);
    this.storedHighlight = null;
    this.storedConnection = null;
};

/**
* Function will disable blocks in the toolbox that are incompatable with the selected connection
*/
Blockly.Accessibility.InBlock.disableIncompatibleBlocks = function(){
    if(this.storedConnection){
        if(this.storedConnection.check_ != null){
            var toolboxChoices = Blockly.Accessibility.MenuNav.getToolboxChoices();  
            for(var i = 0; i < toolboxChoices.length; i++) {

                if(this.storedConnection.type == 1){
                    if(toolboxChoices[i].outputConnection != null){
                        if(toolboxChoices[i].outputConnection.check_ != null){
                            //if their compatibilites don't match up
                            if(toolboxChoices[i].outputConnection.check_[0] != this.storedConnection.check_[0]){

                                toolboxChoices[i].disabled = true;
                                toolboxChoices[i].updateDisabled();

                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                           toolboxChoices[i].disabled = true;
                           toolboxChoices[i].updateDisabled();

                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                            childrenBlocks--;
                        }
                    }
                }
                
                else if(this.storedConnection.type == 3){
                    if(toolboxChoices[i].previousConnection != null){

                        if(toolboxChoices[i].previousConnection.check_ != null){

                            //if their compatibilites don't match up
<<<<<<< HEAD
                            if(toolboxChoices[i].previousConnection.check_[0] != this.storedConnection.check_[0] && toolboxChoices[i].previousConnection.check_[0] != this.storedConnection.check_[1] && toolboxChoices[i].previousConnection.check_[0] != this.storedConnection.check_[2]){
=======
                            if(toolboxChoices[i].previousConnection.check_[0] != this.storedConnection.check_[0]){
>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
                                toolboxChoices[i].disabled = true;
                                toolboxChoices[i].updateDisabled();

                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                        //toolboxChoices[i].setColour(500);
                        toolboxChoices[i].disabled = true;
                        toolboxChoices[i].updateDisabled();

                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                
                            childrenBlocks--;
                        }
                    }
                }

                else if(this.storedConnection.type == 2){
                    if(toolboxChoices[i].inputList[0].connection != null){
                        if(toolboxChoices[i].inputList[0].connection.check_ != null){
                            //if their compatibilites don't match up
                            if(toolboxChoices[i].inputList[0].connection.check_[0] != this.storedConnection.check_[0]){
                                
                                 toolboxChoices[i].disabled = true;
                                 toolboxChoices[i].updateDisabled();

                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                        toolboxChoices[i].disabled = true;
                        toolboxChoices[i].updateDisabled();

                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                            childrenBlocks--;
                        }
                    }
                }

                /**
                ***************************************
                * Type 2 blocks are not yet handled   *
                ***************************************
                */


                //types dont match disable those blocks
                else{
                        toolboxChoices[i].disabled = true;
                        toolboxChoices[i].updateDisabled();

                    var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                    while(childrenBlocks != 0){
                        var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                        childrenBlocks--;
                    }
                }
            }
        }
        else{
            var toolboxChoices = Blockly.Accessibility.MenuNav.getToolboxChoices(); 
            for(var i = 0; i < toolboxChoices.length; i++) {
                if(this.storedConnection.type == 3){
                    if(toolboxChoices[i].outputConnection != null){ 
                        if(toolboxChoices[i].outputConnection.type == 1 || 2){
                            toolboxChoices[i].disabled = true;
                            toolboxChoices[i].updateDisabled();

                            var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                            while(childrenBlocks != 0){
                                var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                                childrenBlocks--;
                            }
                        }
                    }
                }
                else if(this.storedConnection.type == 4){
                    if(toolboxChoices[i].outputConnection != null){ 
                        if(toolboxChoices[i].outputConnection.type == 1 || 2){
                            toolboxChoices[i].disabled = true;
                            toolboxChoices[i].updateDisabled();

                            var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                            while(childrenBlocks != 0){
                                var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1];
                                childrenBlocks--;
                            }
                        }
                    }
                }
                else{
                    //console.log(this.storedConnection);
                    console.log("Not handled yet");
                }
            }
        }
    }
};

/**
 * All of the following are separated so that they can be described as hooks
 */
//#region INNER_ACTION_FUNCTIONS

/**
 * Enters the bottom connection of the selected block
 */
Blockly.Accessibility.InBlock.bottomConnection = function () {
    // This behaviour is essentially just traversing down, so do that.
    //Blockly.Accessibility.Navigation.traverseDown();
};

/**
 * Enters the top connection of the selected block
 */
Blockly.Accessibility.InBlock.topConnection = function () {
    // This behaviour is essentially just traversing up, so do that.
    //Blockly.Accessibility.Navigation.traverseUp();
};

/**
 * Enters the output of a block
 */
Blockly.Accessibility.InBlock.outputConnection = function () {
    if (Blockly.selected.outputConnection.targetConnection != null) {
        // Find the block that's connected to this input and jump to it
        Blockly.Accessibility.Navigation.jumpToID(
            Blockly.selected.outputConnection.targetConnection.sourceBlock_.id);
    }
};

//=============================================================FIELDS=============================================================

 /* Enters the currently selected block if the input isn't null
 */
Blockly.Accessibility.InBlock.input = function () {
    if (this.selectionList[this.connectionsIndex].connection.targetConnection != null) {
        // Find the block that's connected to this input and jump to it
        Blockly.Accessibility.Navigation.jumpToID(
        this.selectionList[this.connectionsIndex].connection.targetConnection.sourceBlock_.id);
    }
};

//=======================DROPDOWNS=======================

/**
 * Allows the user to edit the selected dropDownMenu
 */
Blockly.Accessibility.InBlock.dropDown = function () {

    this.selectionList[this.connectionsIndex].showEditor_();    
};

/**
 * Gets the current SET dropdown field value
 */
Blockly.Accessibility.InBlock.dropDownGetOpts = function(){
    var ddOptions = this.selectionList[this.connectionsIndex].getOptions_();
    return ddOptions;
}

/**
 * Gets the current SET dropdown field value
 */
Blockly.Accessibility.InBlock.dropDownGetVal = function(){
    var ddValue = this.selectionList[this.connectionsIndex].getValue();
    return ddValue;
}

/**
 * Gets the current SET dropdown field value
 */
Blockly.Accessibility.InBlock.dropDownSetVal = function(val, index, prevIndex){

    this.selectionList[this.connectionsIndex].setValue(val);

    //update visuals
    var cnIndex     = document.activeElement.childNodes[index];
    var cnPrevIndex = document.activeElement.childNodes[prevIndex];
    var prevClass   = cnPrevIndex.getAttribute("class");
    var checkClass  = prevClass.replace(".goog-menuitem-checkbox", " ");
    var noSelect    = prevClass.replace("goog-option-selected", " ");
 
    cnIndex.setAttribute("style", "background-color: #d6e9f8;");
    cnIndex.setAttribute("class", checkClass);
    cnPrevIndex.setAttribute("style", "background-color: white;");
    cnPrevIndex.setAttribute("class", noSelect);
}

/*
 * Hide the drop down menu
 */
Blockly.Accessibility.InBlock.hideDropDown = function(){
     try{
<<<<<<< HEAD
  
    	  console.log("Unselected!");
    	  this.selectionList[this.connectionsIndex].sourceBlock_.select();
=======
        this.selectionList[this.connectionsIndex].sourceBlock_.select();
>>>>>>> 65889c6fda0ae3561893af060cbf5026b0104e40
     }
     catch(e){

     }
}


/*
 * Choose the next item in the dropdown then read it aloud(key:S)
 */
Blockly.Accessibility.InBlock.ddNavDown = function(){

    var opts = Blockly.Accessibility.InBlock.dropDownGetOpts();
    var curVal = Blockly.Accessibility.InBlock.dropDownGetVal();
    
    for(var i = opts.length-1; i >= 0; i--){
        
        if(opts[i][1] == curVal){

            if(i == opts.length-1){ //loop at bottom
               Blockly.Accessibility.InBlock.dropDownSetVal(opts[0][1], 0, opts.length-1);
            }
            else{
               Blockly.Accessibility.InBlock.dropDownSetVal(opts[i+1][1], i+1, i);
            }

        }
    }
    
    //read out new value
    curVal     = Blockly.Accessibility.InBlock.dropDownGetVal();
    var valStr = curVal.toString();
    var say    = Blockly.Accessibility.Speech.fieldNameChange(valStr, "notneeded");
    Blockly.Accessibility.Speech.Say(say);
   
}

/*
 * Choose the previous item in the dropdown (W)
 */
Blockly.Accessibility.InBlock.ddNavUp = function(){

    var opts = Blockly.Accessibility.InBlock.dropDownGetOpts();
    var curVal = Blockly.Accessibility.InBlock.dropDownGetVal();

    if(opts){

        for(var i = 0; i < opts.length; i++){

            if(opts[i][1] == curVal){

                if(i == 0){
                    Blockly.Accessibility.InBlock.dropDownSetVal(opts[opts.length-1][1], opts.length-1, 0);
                    break;
                }
                else{
                    Blockly.Accessibility.InBlock.dropDownSetVal(opts[i-1][1], i-1, i);
                    break;
                }
                  
            }
             //read out new value

             curVal  = Blockly.Accessibility.InBlock.dropDownGetVal();
             var valStr = curVal.toString();
             var say = Blockly.Accessibility.Speech.fieldNameChange(valStr, "notneeded")
             Blockly.Accessibility.Speech.Say(say);
        }
    }

}


//===========================Other Fields============================

Blockly.Accessibility.InBlock.getFieldValue = function(){
    this.selectionList[this.connectionsIndex].getText();
}

/**
 * Allows the user to edit the selected textInput
 */
Blockly.Accessibility.InBlock.textInput = function () {
    this.selectionList[this.connectionsIndex].showEditor_();
};

/**
 * Allows the user to choose a colour in the selected colour input
 */
Blockly.Accessibility.InBlock.colour = function () {
    
    this.selectionList[this.connectionsIndex].showEditor_();
};

/**
 * Allows the user to check the check of the currently selected checkbox
 */
Blockly.Accessibility.InBlock.checkbox = function () {
    //Toggles the checkbox
    this.selectionList[this.connectionsIndex].showEditor_();
};

/**
 * Allows the user to edit the date of the currently selected date input
 */
Blockly.Accessibility.InBlock.date = function () {
    // Not fully implemented yet
    this.selectionList[this.connectionsIndex].showEditor_();
};

/**
 * Allows the user to edit the variable of the currently selected variable input
 */
Blockly.Accessibility.InBlock.variable = function () {
    // Sorta works, uses arrow keys at the moment.
    this.selectionList[this.connectionsIndex].showEditor_();
};

//#endregion

// We need to change the way highlighting works if we want to store our own highlights
//#region HIGHLIGHT_CODE

/**
 * Stores all highlights in the scene.
 */
Blockly.Accessibility.InBlock.highlightList = [];

/**
 * Stores a specific highlight for use in connections/additions
 */
Blockly.Accessibility.InBlock.storedHighlight = null;

/**
 * Add highlighting around this connection.
 * @return {svgElement} The highlight that is produced
 */
Blockly.Connection.prototype.returnHighlight = function () {
    var steps;
    if (this.type == Blockly.INPUT_VALUE || this.type == Blockly.OUTPUT_VALUE) {
        var tabWidth = this.sourceBlock_.RTL ? -Blockly.BlockSvg.TAB_WIDTH :
            Blockly.BlockSvg.TAB_WIDTH;
        steps = 'm 0,0 v 5 c 0,10 ' + -tabWidth + ',-8 ' + -tabWidth + ',7.5 s ' +
                tabWidth + ',-2.5 ' + tabWidth + ',7.5 v 5';
    } else {
        if (this.sourceBlock_.RTL) {
            steps = 'm 20,0 h -5 ' + Blockly.BlockSvg.NOTCH_PATH_RIGHT + ' h -5';
        } else {
            steps = 'm -20,0 h 5 ' + Blockly.BlockSvg.NOTCH_PATH_LEFT + ' h 5';
        }
    }
    var xy = this.sourceBlock_.getRelativeToSurfaceXY();
    var x = this.x_ - xy.x;
    var y = this.y_ - xy.y;
    return Blockly.createSvgElement('path',
        {
            'class': 'blocklyHighlightedConnectionPath',
            'd': steps,
            transform: 'translate(' + x + ', ' + y + ')'
        },
        this.sourceBlock_.getSvgRoot());
};

/**
 * Remove the highlighting around the passed in connection.
 * @param {svgElement} Highlighting to be removed
 */
Blockly.Connection.removeHighlight = function (highlight) {
    goog.dom.removeNode(highlight);
};

/**
 * Clears all highlights from the scene that are not part of the separate storage
 */
Blockly.Accessibility.InBlock.clearHighlights = function () {
    for (var i = 0; i < this.highlightList.length; i++) {
        Blockly.Connection.removeHighlight(this.highlightList[i])
    }
    this.highlightList = [];
};

/**
 * Highlights a field as needed for selection.
 * @return {svgElement} The highlight that is produced
 */
Blockly.Field.prototype.highlight = function () {

    var width = this.borderRect_.width.baseVal.value;

    var steps = 'm -5,5 v -19 h ' + width + ' v 19 h ' + (-width - 2);

    // Find the relative position of the field (offset y because otherwise it highlights above the field)
    var mat = this.fieldGroup_.transform.baseVal[0].matrix
    var x = mat.e;
    var y = mat.f+13;

    return Blockly.createSvgElement('path',
        {
            'class': 'blocklyHighlightedConnectionPath',
            'd': steps,
            transform: 'translate(' + x + ', ' + y + ')'
        },
        this.sourceBlock_.getSvgRoot());
};

/*
*   Opens help page for specific block in a new tab
*   TODO: make this dynamic and not hardcoded
*/
Blockly.Accessibility.InBlock.getHelpUrl = function(){
    var url = "./helpPages/index.html";


    switch(Blockly.selected.type){
        case "controls_if":
            url = "./helpPages/logic.html#controls_if";
        break;
        case "controls_elseif":
            url = "./helpPages/logic.html#controls_elseif";
        break;
        case "controls_else":
            url = "./helpPages/logic.html#controls_else";
        break;
        case "logic_compare":
             url = "./helpPages/logic.html#logic_compare";
        break;
        case "logic_operation":
              url = "./helpPages/logic.html#logic_operation";
        break;
        case "logic_negate":
            url = "./helpPages/logic.html#negate";
        break;
        case "logic_boolean":
            url = "./helpPages/logic.html#logic_boolean";
        break;
        case "logic_null":
            url = "./helpPages/logic.html#logic_null";
        break;
        case "logic_ternary":
            url = "./helpPages/logic.html#logic_ternary";
        break;
        case "controls_repeat_ext":
            url = "./helpPages/loops.html#controls_repeat_ext";
        break;
        case "controls_repeat":
            url = "./helpPages/loops.html#controls_repeat";
        break;
        case "controls_whileUntil":
            url = "./helpPages/loops.html#controls_whileUntil";
        break;
        case "controls_for":
            url = "./helpPages/loops.html#controls_for";
        break;
        case "controls_forEach":
            url = "./helpPages/loops.html#controls_forEach";
        break;
        case "controls_flow_statements":
            url = "./helpPages/loops.html#controls_flow_statements";
        break;
        case "math_number":
            url = "./helpPages/math.html#math_number#math_number";
        break;
        case "math_arithmetic":
            url = "./helpPages/math.html#math_arithmetic";
        break;
        case "math_single":
            url = "./helpPages/math.html#math_single";
        break;
        case "math_trig":
             url = "./helpPages/math.html#math_trig";
        break;
        case "math_constant":
             url = "./helpPages/math.html#math_constant";
        break;
        case "math_number_property":
            url = "./helpPages/math.html#math_number_property";
        break;
        case "math_change":
            url = "./helpPages/math.html#math_change";
        break;
        case "math_round":
            url = "./helpPages/math.html#math_round";
        break;
        case "math_on_list":
            url = "./helpPages/math.html#math_on_list";
        break;
        case "math_modulo":
            url = "./helpPages/math.html#math_modulo";
        break;
        case "math_contrain":
            url = "./helpPages/math.html#math_contrain";
        break;
        case "math_random_int":
            url = "./helpPages/math.html#math_random_int";
        break;
        case "math_random_float":
            url = "./helpPages/math.html#math_random_float";
        break;
        case "text":
            url = "./helpPages/text.html#text";
        break;
        case "text_join":
            url = "./helpPages/text.html#text_join";
        break;
        case "text_append":
            url = "./helpPages/text.html#text_append";
        break;
        case "text_length":
            url = "./helpPages/text.html#text_length";
        break;
        case "text_isEmpty":
            url = "./helpPages/text.html#text_isEmpty";
        break;
        case "text_indexOf":
            url = "./helpPages/text.html#text_indexOf";
        break;
        case "text_charAt":
            url = "./helpPages/text.html#text_charAt";
        break;
        case "text_getSubstring":
            url = "./helpPages/text.html#text_getSubstring";
        break;
        case "text_changeCase":
            url = "./helpPages/text.html#text_changeCase";
        break;
        case "text_trim":
            url = "./helpPages/text.html#text_trim";
        break;
        case "text_print":
            url = "./helpPages/text.html#text_print";
        break;
        case "text_prompt_ext":
            url = "./helpPages/text.html#text_prompt_ext";
        break;
        case "lists_create_empty":
            url = "./helpPages/lists.html#lists_create_empty";
        break;
        case "lists_create_with":
            url = "./helpPages/lists.html#lists_create_with";
        break;
        case "lists_repeat":
            url = "./helpPages/lists.html#lists_repeat";
        break;
        case "lists_length":
            url = "./helpPages/lists.html#lists_length";
        break;
        case "lists_isEmpty":
            url = "./helpPages/lists.html#lists_isEmpty";
        break;
        case "lists_indexOf":
            url = "./helpPages/lists.html#lists_indexOf";
        break;
        case "lists_getIndex":
            url = "./helpPages/lists.html#lists_getIndex";
        break;
        case "lists_setIndex":
            url = "./helpPages/lists.html#lists_setIndex";
        break;
        case "lists_getSublist":
            url = "./helpPages/lists.html#lists_getSublist";
        break;
        case "lists_split":
            url = "./helpPages/lists.html#lists_split";
        break;
        case "colour_picker":
            url = "./helpPages/colour.html#colour_picker";
        break;
        case "colour_random":
            url = "./helpPages/colour.html#colour_random";
        break;
        case "colour_rgb":
            url = "./helpPages/colour.html#colour_rgb";
        break;
        case "colour_blend":
            url = "./helpPages/colour.html#colour_blend";
        break;
        case "procedures_defnoreturn":
            url = "./helpPages/functions.html#procedures_defnoreturn";
        break;
        case "procedures_defreturn":
            url = "./helpPages/functions.html#procedures_defreturn"; 
        break;
        case "procedures_callnoreturn":
            url = "./helpPages/functions.html#procedures_callnoreturn"; 
        break;
        case "procedures_callreturn":
            url = "./helpPages/functions.html#procedures_callreturn"; 
        break;
        case "procedures_ifreturn":
            url = "./helpPages/functions.html#procedures_ifreturn";
        default:
        break;
    }

    window.open(url, "_blank");
}
//#endregion