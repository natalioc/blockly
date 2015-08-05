'use strict';

/**
*Copyright 2015 Luna Meier
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
 * @author lunalovecraft@gmail.com (Luna Meier)
 */

goog.provide('Blockly.Accessibility.InBlock');

goog.require('Blockly.Accessibility.Navigation');
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

    console.log(this.selectionList[this.connectionsIndex]);

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

    console.log(this.selectionList[this.connectionsIndex]);

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

    console.log(this.selectionList[this.connectionsIndex]);

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
        console.log('storing');
        this.selectionList = [];
        this.storedHighlight = this.storedConnection.returnHighlight();
    }
    else {
        console.log('connecting');
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

    if(this.storedConnection.check_ != null){
        //sometimes get an error when we don't predefine the variable
        var loopDistance = this.storedConnection.check_.length;
        for (var i = 0; i < loopDistance; i++){
            var selectedNode = Blockly.Accessibility.menu_nav.getMenuSelection();
            if(this.storedConnection.type == 1){
                if(selectedNode.outputConnection.check_[0] == this.storedConnection.check_[i]){
                    var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
                    this.safeConnect(newBlock.outputConnection);
                }
            }
            else if(this.storedConnection.type == 2){
                if(selectedNode.inputList[0].connection.check_[0] == this.storedConnection.check_[i]){
                    var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
                    this.safeConnect(newBlock.inputList[0].connection);
                }
            }
            //these blocks are not compatable
            else{
                console.log("these blocks are not compatable");
            }
        }
    }
    //these blocks are compatable because anything can connect to this block
    else{
        if(this.storedConnection.type == 1){
            var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
            this.safeConnect(newBlock.outputConnection);
        }
        else if(this.storedConnection.type == 2){
            var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
            this.safeConnect(newBlock.inputList[0].connection);
        }
        else if(this.storedConnection.type == 3){
            var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
            this.safeConnect(newBlock.previousConnection);
        }
        else if(this.storedConnection.type == 4){
            var newBlock = Blockly.Accessibility.menu_nav.flyoutToWorkspace();
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
            var toolboxChoices = Blockly.Accessibility.menu_nav.getToolboxChoices();  
            for(var i = 0; i < toolboxChoices.length; i++) {
                if(this.storedConnection.type == 1){
                    if(toolboxChoices[i].outputConnection != null){
                        if(toolboxChoices[i].outputConnection.check_ != null){
                            //if their compatibilites don't match up
                            if(toolboxChoices[i].outputConnection.check_[0] != this.storedConnection.check_[0]){
                                toolboxChoices[i].setColour(500);
                                toolboxChoices[i].disabled = true;
                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                        toolboxChoices[i].setColour(500);
                        toolboxChoices[i].disabled = true;
                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                            childrenBlocks--;
                        }
                    }
                }
                
                else if(this.storedConnection.type == 3){
                    if(toolboxChoices[i].previousConnection != null){
                        if(toolboxChoices[i].previousConnection.check_ != null){
                            //if their compatibilites don't match up
                            if(toolboxChoices[i].previousConnection.check_[0] != this.storedConnection.check_[0]){
                                toolboxChoices[i].setColour(500);
                                toolboxChoices[i].disabled = true;
                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                        toolboxChoices[i].setColour(500);
                        toolboxChoices[i].disabled = true;
                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                            childrenBlocks--;
                        }
                    }
                }

                else if(this.storedConnection.type == 2){
                    if(toolboxChoices[i].inputList[0].connection != null){
                        if(toolboxChoices[i].inputList[0].connection.check_ != null){
                            //if their compatibilites don't match up
                            if(toolboxChoices[i].inputList[0].connection.check_[0] != this.storedConnection.check_[0]){
                                toolboxChoices[i].setColour(500);
                                toolboxChoices[i].disabled = true;
                                var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                                while(childrenBlocks != 0){
                                    var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                                    childrenBlocks--;
                                }
                            }
                        }
                    }
                    //its the null block and anything like it
                    else{
                        toolboxChoices[i].setColour(500);
                        toolboxChoices[i].disabled = true;
                        var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                        while(childrenBlocks != 0){
                            var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
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
                    toolboxChoices[i].setColour(500);
                    toolboxChoices[i].disabled = true;
                    var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                    while(childrenBlocks != 0){
                        var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                        childrenBlocks--;
                    }
                }
            }
        }
        else{
            var toolboxChoices = Blockly.Accessibility.menu_nav.getToolboxChoices();  
            for(var i = 0; i < toolboxChoices.length; i++) {
                if(this.storedConnection.type == 3){
                    if(toolboxChoices[i].outputConnection != null){ 
                        if(toolboxChoices[i].outputConnection.type == 1 || 2){
                            toolboxChoices[i].setColour(500);
                            toolboxChoices[i].disabled = true;
                            var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                            while(childrenBlocks != 0){
                                var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                                childrenBlocks--;
                            }
                        }
                    }
                }
                else if(this.storedConnection.type == 4){
                    if(toolboxChoices[i].outputConnection != null){ 
                        if(toolboxChoices[i].outputConnection.type == 1 || 2){
                            toolboxChoices[i].setColour(500);
                            toolboxChoices[i].disabled = true;
                            var childrenBlocks = toolboxChoices[i].childBlocks_.length;
                            while(childrenBlocks != 0){
                                var childSVG = toolboxChoices[i].childBlocks_[childrenBlocks - 1].setColour(500);
                                childrenBlocks--;
                            }
                        }
                    }
                }
                else{
                    conosle.log(this.storedConnection);
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
    Blockly.Accessibility.Navigation.traverseDown();
};

/**
 * Enters the top connection of the selected block
 */
Blockly.Accessibility.InBlock.topConnection = function () {
    // This behaviour is essentially just traversing up, so do that.
    Blockly.Accessibility.Navigation.traverseUp();
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

/**
 * Enters the currently selected block if the input isn't null
 */
Blockly.Accessibility.InBlock.input = function () {
    if (this.selectionList[this.connectionsIndex].connection.targetConnection != null) {
        // Find the block that's connected to this input and jump to it
        Blockly.Accessibility.Navigation.jumpToID(
            this.selectionList[this.connectionsIndex].connection.targetConnection.sourceBlock_.id);
    }
};

/**
 * Allows the user to edit the selected dropDownMenu
 */
Blockly.Accessibility.InBlock.dropDown = function () {
    // Sorta complete, no way to select a specific option yet without arrow keys
    this.selectionList[this.connectionsIndex].showEditor_();
};

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

    // This is the only way I've found that allows me to find the relative position of the field
    var mat = this.fieldGroup_.transform.baseVal[0].matrix
    var x = mat.e;
    var y = mat.f;

    return Blockly.createSvgElement('path',
        {
            'class': 'blocklyHighlightedConnectionPath',
            'd': steps,
            transform: 'translate(' + x + ', ' + y + ')'
        },
        this.sourceBlock_.getSvgRoot());
};


//#endregion