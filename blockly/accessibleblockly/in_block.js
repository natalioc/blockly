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

    //this.inputList = Blockly.selected.inputList;
    this.selectionList = [];
    if (true) { //if(you can add a block to the bottom of the current block)
        this.selectionList.push('bottomConnection');
    }

    if (true) { //if(you can add a block to  the top of the current block)
        this.selectionList.push('topConnection');
    }

    // Go through all of the inputs for the current block and see what you can add where
    for (var i = 0; i < Blockly.selected.inputList.length; i++) {
        if (Blockly.selected.inputList[i].fieldRow.length > 0) {
            for (var j = 0; j < Blockly.selected.inputList[i].fieldRow.length; j++) {
                if (!(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldLabel) &&
                    !(Blockly.selected.inputList[i].fieldRow[j] instanceof Blockly.FieldImage)) {
                    this.selectionList.push(Blockly.selected.inputList[i].fieldRow[j]);
                }
            }
        }

        if (Blockly.selected.inputList[i].name != '') {
            this.selectionList.push(Blockly.selected.inputList[i]);
        }
    }

    if (this.selectionList.length == 0) {
        return false;
    }

    this.connectionsIndex = 0;

    return true;
};

/**
 * Selects the next value or field within the current block
 */
Blockly.Accessibility.InBlock.selectNext = function () {
    this.connectionsIndex++;
    if (this.connectionsIndex >= this.selectionList.length) {
        this.connectionsIndex = 0;
    }

    console.log(this.selectionList[this.connectionsIndex]);
};

/**
 * Selects the previous value or field within the current block
 */
Blockly.Accessibility.InBlock.selectPrev = function () {

    this.connectionsIndex--;
    if (this.connectionsIndex < 0) {
        this.connectionsIndex = this.selectionList.length - 1;
    }

    console.log(this.selectionList[this.connectionsIndex]);
};

/**
 * Selects the current field if a field is selected, or selects
 * the current block if a value or statement is selected
 */
Blockly.Accessibility.Inblock.enterSelected = function () {


    //See INNER_ACTION_FUNCTIONS region below for functions
    if (this.selectionList[this.connectionsIndex] === 'bottomConnection') {
        this.bottomConnection();
    }
    else if (this.selectionList[this.connectionsIndex] === 'topConnection') {
        this.topConnection();
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
 * If a value or statement is selected, add a block to it.
 */
Blockly.Accessibility.InBlock.addBlock = function () {

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
    this.traverseDown();
};

/**
 * Enters the top connection of the selected block
 */
Blockly.Accessibility.InBlock.topConnection = function () {
    // This behaviour is essentially just traversing up, so do that.
    this.traverseUp();
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
    // Code to select a dropdown field to allow for remote selection here
    console.log('DROPDOWN ENTERING NOT IMPLEMENTED');
};

/**
 * Allows the user to edit the selected textInput
 */
Blockly.Accessibility.InBlock.textInput = function () {
    // Code to select a textInput field to allow for remote selection here
    console.log('TEXTINPUT ENTERING NOT IMPLEMENTED');
};

/**
 * Allows the user to choose a colour in the selected colour input
 */
Blockly.Accessibility.InBlock.colour = function () {
    // Code to select a colour field to allow for remote selection here
    console.log('COLOUR ENTERING NOT IMPLEMENTED');
};

/**
 * Allows the user to check the check of the currently selected checkbox
 */
Blockly.Accessibility.InBlock.checkbox = function () {
    // Code to select a checkbox field to allow for remote selection here
    console.log('CHECKBOX ENTERING NOT IMPLEMENTED');
};

/**
 * Allows the user to edit the date of the currently selected date input
 */
Blockly.Accessibility.InBlock.date = function () {
    // Code to select a date field to allow for remote selection here
    console.log('DATE ENTERING NOT IMPLEMENTED');
};

/**
 * Allows the user to edit the variable of the currently selected variable input
 */
Blockly.Accessibility.InBlock.variable = function () {
    // Code to select a variable field to allow for remote selection here
    console.log('VARIABLE ENTERING NOT IMPLEMENTED');
};