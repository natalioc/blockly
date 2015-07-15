'use strict';

/**
*Copyright 2015 Luna Meier, Rachael Bosley
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
 * @fileoverview Core navigation library for Accessible Blockly Plugin.
 * Allows for traversal around blocks, as well as keeping things up to date.
 * @author lunalovecraft@gmail.com (Luna Meier)
 */

goog.provide('Blockly.Accessibility.Navigation');

goog.require('Blockly.Accessibility');

var xmlDoc = null;
var currentNode = null;

// If this variable is true then updateXmlSelection will skip.  Use this in case of problematic updates
var disableUpdate = false;

var undoStack = [];
var redoStack = [];



//#region XML_UPDATING

// Default functions for our hooks.
Blockly.BlockSvg.prototype.defaultSelect = Blockly.BlockSvg.prototype.select;
Blockly.BlockSvg.prototype.defaultDispose = Blockly.BlockSvg.prototype.dispose;
/**
 * Select this block.  Highlight it visually.
 */
Blockly.BlockSvg.prototype.select = function () {

    this.defaultSelect();

    if (Blockly.Accessibility.Navigation.getBlockNodeById(this.id)) {
        currentNode = Blockly.Accessibility.Navigation.getBlockNodeById(this.id);

        console.log(this.id);
        console.log(this);
    }
};

/**
 * Dispose of this block.
 * @param {boolean} healStack If true, then try to heal any gap by connecting
 *     the next statement with the previous statement.  Otherwise, dispose of
 *     all children of this block.
 * @param {boolean} animate If true, show a disposal animation and sound.
 * @param {boolean} opt_dontRemoveFromWorkspace If true, don't remove this
 *     block from the workspace's list of top blocks.
 */
Blockly.BlockSvg.prototype.dispose = function (healStack, animate,
                                              opt_dontRemoveFromWorkspace) {
    this.defaultDispose(healStack, animate, opt_dontRemoveFromWorkspace);

    Blockly.Accessibility.Navigation.updateXmlSelection(true);
};

Array.prototype.contains = function(element) {
    return this.indexOf(element) > -1;
};

//#endregion


/**
 * Loads the xmldoc based on the current blockly setting.
 * @param {boolean} Optional paramater.  If true, then don't select a block after updating the xml.
 */
Blockly.Accessibility.Navigation.updateXmlSelection = function (noSelect) {

    if (disableUpdate){
        return;
    }

    var prevXml = null;
    if (xmlDoc != null) {
        prevXml = Blockly.Xml.domToPrettyText(xmlDoc);
    }
	console.log('UpdateXML');
	
    if (noSelect){
        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        currentNode = null;
    }


   // console.log('Updating XML.');
    // If you currently have a node, make sure that if all block id's change you are still selecting the same block.
    if (currentNode) {
        //console.log('Maintaining Position');
        var pastId = parseInt(currentNode.getAttribute('id'));
        var idDifference = parseInt(Blockly.Accessibility.Navigation.findContainers()[0].getAttribute('id'));

        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);

        idDifference = parseInt(Blockly.Accessibility.Navigation.findContainers()[0].getAttribute('id')) - idDifference;
        Blockly.Accessibility.Navigation.jumpToID(pastId + idDifference);
    }
        // Otherwise this is a non-issue
    else {
        //console.log('Finding block.');
        xmlDoc = Blockly.Xml.workspaceToDom(Blockly.mainWorkspace);
        if (!xmlDoc.getElementsByTagName('BLOCK')) {
            currentNode = xmlDoc.getElementsByTagName('BLOCK')[0];
        }
    }

    // Check to see if we are adding this to the undo/redo stack
    if (Blockly.Xml.domToPrettyText(xmlDoc) != prevXml)
    {
        // If we are, remember the previous xml selection, and clear the redo stack.
        undoStack.push(prevXml);
        redoStack = [];

        console.log('THERE WAS A CHANGE');
        
    }
};

/**
 * Undo the previous action
 */
Blockly.Accessibility.Navigation.undo = function() {
    if(undoStack.length <= 1)
    {
        return;
    }

    // Go back to the previous, keep track of stuff in case you want to redo, and update the scene.
    redoStack.push(Blockly.Xml.domToPrettyText(xmlDoc));
    xmlDoc = Blockly.Xml.textToDom(undoStack.pop());
    Blockly.Accessibility.Navigation.updateBlockSelection();
};

/**
 * Undo your undo.
 */
Blockly.Accessibility.Navigation.redo = function () {
    if (redoStack.length == 0) {
        return;
    }

    // Go back to the previous, keep track of stuff in case you want to redo, and update the scene.
    undoStack.push(Blockly.Xml.domToPrettyText(xmlDoc));
    xmlDoc = Blockly.Xml.textToDom(redoStack.pop());
    Blockly.Accessibility.Navigation.updateBlockSelection();
};


/**
 * Import the xml into the file, and update the xml in case of id changes.
 */
Blockly.Accessibility.Navigation.updateBlockSelection = function () {
    disableUpdate = true;
    workspace.clear();
    Blockly.Xml.domToWorkspace(Blockly.mainWorkspace, xmlDoc);
    console.log(xmlDoc);
    disableUpdate = false;
};

//#region JUMP_FUNCTIONS

/**
 * Sets the current node to the one at the top of this section of blocks
 */
Blockly.Accessibility.Navigation.jumpToTopOfSection = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('Jumping to top of section.');
    currentNode = Blockly.Accessibility.Navigation.findTop(currentNode);
    console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
    Blockly.Accessibility.Navigation.updateSelection();
};

/**
 * Sets the current node to the one at the bottom of this section of blocks
 */
Blockly.Accessibility.Navigation.jumpToBottomOfSection = function () {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('Jumping to bottom of section.');
    currentNode = Blockly.Accessibility.Navigation.findTop(currentNode);
    console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
    Blockly.Accessibility.Navigation.updateSelection();
};

/**
 * Jumps between containers (the very outside of block groups).
 * @param {int} The container's number that you are jumping to
 */
Blockly.Accessibility.Navigation.jumpToContainer = function(containerNumber) {

    console.log('Jumping to container ' + containerNumber);
    var containers = Blockly.Accessibility.Navigation.findContainers();

    // Jump to the appropriate section.
    if (containers[containerNumber]) {
        currentNode = containers[containerNumber];
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }

    console.log('Container does not exist.');
};

/**
 * Jump to a specific id.
 * @param {int} The id of the block that you are jumping to
 */
Blockly.Accessibility.Navigation.jumpToID = function(id) {
    console.log('Jumping to block with id ' + id);
    var jumpTo = Blockly.Accessibility.Navigation.getBlockNodeById(id);
    if (jumpTo) {
        currentNode = jumpTo;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }

    console.log('Block with id ' + id + ' not found.');
};

//#endregion

//#region TRAVERSAL_FUNCTIONS

/**
 * Goes out of a block to go up a level
 */
Blockly.Accessibility.Navigation.traverseOut = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseOut called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
	
    // If this is within other blocks, then its parent will be a statement, or a value
    if (Blockly.Accessibility.Navigation.findTop(currentNode).parentNode.nodeName.toUpperCase() == 'STATEMENT' ||
        Blockly.Accessibility.Navigation.findTop(currentNode).parentNode.nodeName.toUpperCase() == 'VALUE') {
        currentNode = Blockly.Accessibility.Navigation.findTop(currentNode).parentNode.parentNode;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }
    // If it's not, then do nothing, you cannot go in.
    console.log('Cannot traverse outwards from here.');
};

/** 
 * Goes inside of one block to go down a level
 */
Blockly.Accessibility.Navigation.traverseIn = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseIn called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a statement.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a statement, then we're moving straight to that node's child, which is a block.
        if (children[i].nodeName.toUpperCase() == 'STATEMENT') {
            currentNode = children[i].getElementsByTagName('BLOCK')[0];
            console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
            Blockly.Accessibility.Navigation.updateSelection();
            return;
        }
    }
    // If you don't, then do nothing, you cannot go in.
    console.log('Cannot traverse inwards from here.');
};

/**
 * Goes from one block to the next above it (no travel between layers)
 */
Blockly.Accessibility.Navigation.traverseUp = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseUp called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // If your parent is a next, then its parent must be a block.  So move to it. 
    if (currentNode.parentNode.nodeName.toUpperCase() == 'NEXT') {
        currentNode = currentNode.parentNode.parentNode;
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }

    // If it's not you're at the top, so then...

    // If cycle is enabled go to the bottom
    if (doCycle) {
        currentNode = findBottom(currentNode);
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }

    // Otherwise just end.
    //  Otherwise just report that you've hit the bottom.
    console.log('Cannot traverse up, top of list');
    this.previousContainer();
};

/**
 * Goes from one block to the next below it (no travel between layers)
 */
Blockly.Accessibility.Navigation.traverseDown = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    console.log('traverseDown called.');
    console.log('Attempting to leave ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = currentNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a next, then we're moving straight to that node.
        if (children[i].nodeName.toUpperCase() == 'NEXT') {
            currentNode = children[i].getElementsByTagName('BLOCK')[0];
            console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id'));
            Blockly.Accessibility.Navigation.updateSelection();
            return;
        }
    }
    // If you don't find a next then...

    // Cycle back to the top node if cycle is enabled
    if (doCycle) {
        currentNode = Blockly.Accessibility.Navigation.findTop(currentNode);
        console.log('Going to ' + currentNode.nodeName + ' with id ' + currentNode.getAttribute('id') + ' via cycle.');
        Blockly.Accessibility.Navigation.updateSelection();
        return;
    }

    //  Otherwise just report that you've hit the bottom.
    console.log('Cannot traverse down, end of list');
    this.nextContainer();
};

/**
 * Jumps you to the next container based on the one you are currently in
 */
Blockly.Accessibility.Navigation.nextContainer = function () {
    // Compare the region you're in to all of the other ones
    var currentSectionNode = this.getOutermostNode(currentNode);
    var myContainers = this.findContainers();


    // Just jump to the next one.
    for(var i = 0; i < myContainers.length; i++)
    {
        if (myContainers[i] == currentSectionNode) {
            if(i + 1 == myContainers.length)
            {
                this.jumpToContainer(0);
            }
            else {
                this.jumpToContainer(i + 1);
            }
        }
    }
};

/**
 * Jumps you to the previous container based on the one you are currently in
 */
Blockly.Accessibility.Navigation.previousContainer = function () {
    // Compare the region you're in to all of the other ones
    var currentSectionNode = this.getOutermostNode(currentNode);
    var myContainers = this.findContainers();


    // Just jump to the previous one.
    for (var i = 0; i < myContainers.length; i++) {
        if (myContainers[i] == currentSectionNode) {
            if (i - 1 < 0) {
                this.jumpToContainer(myContainers.length - 1);
            }
            else {
                this.jumpToContainer(i - 1);
            }
        }
    }
};


//#endregion

//#region HELPER_FUNCTIONS

/**
 * Navigates up to the top of a current section of blocks. Gets
 * to the top of the current indentation.
 * @param {myNode} Any node to be navigated from
 * @return {myNode} The top node in the level
 */
Blockly.Accessibility.Navigation.findTop = function(myNode) {
    // If the block's parent is a next node, that means it's below another.  Recursively go up.
    if (myNode.parentNode.nodeName.toUpperCase() == 'NEXT') {
        myNode = myNode.parentNode.parentNode;
        return Blockly.Accessibility.Navigation.findTop(myNode);
    }
    // If it's not the child of a next node, then it's the top node.
    return myNode;
};

/** 
 * Navigates to the bottom of a section of blocks.
 * @param {node} Any node to be navigated from
 * @return {node} The bottom node in the level
 */
Blockly.Accessibility.Navigation.findBottom = function(myNode) {

    // Grab the children nodes of the current node, and see if any of them are a next.
    var children = myNode.childNodes;
    for (var i = 0; i < children.length; i++) {
        // If you do find a next, then we're moving straight to the block under.
        if (children[i].nodeName.toUpperCase() == 'NEXT') {
            myNode = children[i].getElementsByTagName('BLOCK')[0];
            return findBottom(myNode);
        }
    }
    // If you can't find a next, you're at the bottom.
    return myNode;

};

/**
 * Finds all of the containers in the current xmlstring and returns them.
 */
Blockly.Accessibility.Navigation.findContainers = function() {

    // There is something weird going on with the xml parent child relationship.  For some reason I can't directly 
    // grab the XML node, but this seems to work.  Further investigation needed.
    // I know that the first block is always going to be a region, so this should work
    // until a more clean solution is found.
    var containers = xmlDoc.getElementsByTagName('BLOCK')[0].parentNode.childNodes;

    // Need to remove parts that aren't blocks in case of #text's appearing for some reason.  We only want to deal with blocks.
    for (var i = containers.length - 1; i >= 0; i--) {
        if (containers[i].nodeName.toUpperCase() != 'BLOCK') {
            containers.splice(i, 1);
        }
    }

    return containers;
};

/**
 * Selects the block that you are currently on the node of
 */
Blockly.Accessibility.Navigation.updateSelection = function() {

    if (!currentNode) {
        console.log('Nothing Selected.')
        return;
    }

    Blockly.Block.getById(parseInt(currentNode.getAttribute('id')), workspace).select();

    Blockly.Accessibility.TreeView.infoBoxFill(currentNode);
};

/**
 * Gets a specific node based on the block id.
 * @param {int} the block id number 
 * @return {node} the block node
 */
Blockly.Accessibility.Navigation.getBlockNodeById = function(id) {

    if (!xmlDoc || !xmlDoc.getElementsByTagName('BLOCK')) {
        return null;
    }
	
    // Go through every block until you find the one with the right id
    var myBlocks = xmlDoc.getElementsByTagName('BLOCK');
    for (var i = 0; i < myBlocks.length; i++) {
        if (parseInt(myBlocks[i].getAttribute('id')) == id) {
            return myBlocks[i];
        }
    }
    // If you don't hit it return null.
    return null;
};

/**
 * Gets the first node of the region the node is in
 * @param {node} the node you want to find the region of
 * @return {node} the uppermost, outermost node
 */
Blockly.Accessibility.Navigation.getOutermostNode = function(inputNode){
    var myNode = inputNode;
    // temporary node used to store the previous iteration's current node
    var lastNode = null;

    // If myNode and lastNode are equal, then we've reached the outermost block
    while (myNode != lastNode) {
        lastNode = myNode;

        //Go to the top of the section
        myNode = this.findTop(myNode);

        //If you can pull out of the section, pull out of it
        if (myNode.parentNode.nodeName.toUpperCase() == 'STATEMENT' ||
        myNode.parentNode.nodeName.toUpperCase() == 'VALUE') {
            myNode = myNode.parentNode.parentNode;
        }

    }

    return myNode;
};

Blockly.Accessibility.Navigation.getCurrentNode = function() {
    return currentNode;
};

Blockly.Accessibility.Navigation.playAudioBlock = function() {
    var here=getCurrentNode();
    var now=here.getAttribute('type');
    workspace.playAudio(Blockly.Blocks[now].returnAudio());
};

//#endregion