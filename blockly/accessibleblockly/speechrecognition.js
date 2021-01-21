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
goog.provide('Blockly.Accessibility.SpeechRecognition');
goog.require('Blockly.Accessibility.MenuNav');
goog.require('Blockly.Flyout');

if (!('webkitSpeechRecognition' in window)) {
    upgrade();
} 
else {
    let recognition = new webkitSpeechRecognition();

    recognition.lang = "en-US";
    recognition.continuous = true;
    recognition.interimResults = false;

    recognition.onresult = (event) => {
        const transcript = event.results[event.results.length - 1][0].transcript
            .toLowerCase()
            .trim();

        switch (transcript) {

            //go to menu
            case 'open menu':
                console.log('Open Menu');
                //default select the first category in the menu
                var firstCategory = document.getElementById(":1");
                firstCategory.focus();
                break;

            //close menu
            case 'close menu':
                console.log('Close Menu');
                //remove highlight
                Blockly.Flyout.prototype.hide();
                break;
            
            //select previous block
            case 'move up':
                console.log('Move Up');
                if (this.getExpanded()) {
                    Blockly.Accessibility.MenuNav.prototype.menuNavUp();
                }

                //select previous category
                else {
                    var previousSibling = this.getPreviousSibling(this.selected);

                    //if not the top category
                    if (previousSibling != null) {
                        previousSibling.select();
                        Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
                        document.getElementById(previousSibling.id_).focus();
                    }

                }
                break;

            //select next block
            case 'move down':
                console.log('Move Down');
                if (this.getExpanded()) {
                    Blockly.Accessibility.MenuNav.prototype.menuNavDown();
                }

                //select next category
                else {
                    var nextSibling = this.getNextSibling(this.selected);


                    //if not the bottome category
                    if (nextSibling != null) {
                        nextSibling.select();
                        Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
                        document.getElementById(nextSibling.id_).focus();
                    }

                } 
                break;

            //move outside the flyout to select blocks
            case 'move out':
                console.log('Move Out');
                if (this.getExpanded()) {
                    this.setExpanded(false);
                    menuVars.flyoutArr[menuVars.prevIndex].removeSelect();
                    menuVars.blockSelected = false;
                }
                break;

            //move inside the flyout to select blocks
            case 'move in':
                console.log('Move In');
                this.select();
                console.log(this);
                this.setExpanded(true);
                Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
                Blockly.Accessibility.MenuNav.prototype.menuNavDown();
                menuVars.blockSelected = true;
                break;
            
            // enter selection
            case 'enter':
                //open the flyout
                console.log('Enter')
                if (!this.getExpanded()) {
                    this.select();
                    Blockly.Accessibility.InBlock.disableIncompatibleBlocks();
                }

                //selecting and connecting blocks
                else if (this.getExpanded()) {

                    //connect to a block on the workspace
                    if (Blockly.Accessibility.Keystrokes.prototype.isConnecting && menuVars.blockSelected) {
                        Blockly.Accessibility.Keystrokes.prototype.isConnecting = false;
                        menuVars.blockSelected = false;
                        this.setExpanded(false);
                        this.getTree().setSelectedItem(null);

                        Blockly.Accessibility.InBlock.addBlock();
                        document.getElementById("blockReader").focus();
                    }

                    //top blocks move or connect new blocks so they dont automatically default to (0,0)
                    else if (!Blockly.Accessibility.Keystrokes.prototype.isConnecting && menuVars.blockSelected) {

                        //reset everything
                        menuVars.blockSelected = false;
                        this.setExpanded(false);
                        this.getTree().setSelectedItem(null);

                        var containers = Blockly.Accessibility.MenuNav.containersArr;
                        var curBlock = menuVars.flyoutArr[menuVars.prevIndex];
                        var menuBlock = Blockly.selected;
                        var contLength = Blockly.Accessibility.MenuNav.containersArr.length;


                        //if not a statement block
                        if (!curBlock.nextConnection) {

                            //handle procedure(function) blocks
                            if (curBlock.type == "procedures_defnoreturn" || curBlock.type == "procedures_defreturn") {

                                Blockly.Accessibility.MenuNav.flyoutToWorkspace();

                                var proBlock = Blockly.selected;
                                Blockly.Accessibility.MenuNav.containersArr.push(proBlock);
                                Blockly.Accessibility.MenuNav.moveToBottom();

                            }

                            else {
                                Blockly.Accessibility.Speech.Say("This block should be connected to another block");
                            }
                        }

                        //first iteration
                        else if (containers.length == 0) {

                            Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                            Blockly.Accessibility.MenuNav.containersArr.push(Blockly.selected);

                        }

                        else {
                            Blockly.Accessibility.MenuNav.flyoutToWorkspace();
                            Blockly.Accessibility.MenuNav.containersArr.push(Blockly.selected);


                            Blockly.mainWorkspace.addTopBlock(menuBlock);

                            // if(!Blockly.Accessibility.MenuNav.containersArr){
                            //    Blockly.Accessibility.MenuNav.containersArr = Blockly.mainWorkspace.getTopBlocks(true);
                            // }

                            Blockly.Accessibility.MenuNav.connectToLastBlock(menuBlock);
                            Blockly.mainWorkspace.removeTopBlock(menuBlock);
                        }
                        document.getElementById("blockReader").focus();
                    }
                }
                break;
            default:
                console.log('do not recognize command');
        }
    }

    recognition.start();
}


