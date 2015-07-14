'use strict';

/**
*Copyright 2015 
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
 * @fileoverview File for navigating through the toolbox menu.
 * @author 
 */

goog.provide('Blockly.Accessibility.MenuNav');

goog.require('Blockly.Accessibility.Navigation');
goog.require('Blockly.Accessibility');

//called when the flyout opens
Blockly.Flyout.prototype.show = function(xmlList){

    oldLength = flyoutArr.length; //update the length of the last array 

    if(oldLength>0){              //ignore first case
        tabCount  = oldLength;
    }

    this.defaultShow(xmlList);    //call default and update flyoutArr
    flyoutArr = menuBlocksArr;
};

//Navigate down through the menu using down arrow
Blockly.Accessibility.MenuNav.menuNavDown = function(){

    //remove last select if not the first
    if(tabCount-1 >= 0 && tabCount!= oldLength){
        flyoutArr[tabCount-1].removeSelect();
    }

    //handle loops
    // if tabcount too high       || in variables menu                 || switching directions at the bottom of the menu
    if(tabCount>=flyoutArr.length || (flyoutArr.length-oldLength == 2) || (lastTabCount == tabCount+1 && tabCount+2>=flyoutArr.length)){
        tabCount = oldLength;
        lastTabCount=flyoutArr.length-1; 
        flyoutArr[lastTabCount].removeSelect();
    }

   //handle switching from up to down
   // if normal switch scenario  && not in variable menu
   if(lastTabCount == tabCount+1 && flyoutArr.length-oldLength!=2){
        flyoutArr[lastTabCount].removeSelect();
        tabCount+=2;
    }


    //select next -> save last -> increase count 
    flyoutArr[tabCount].addSelect(); 
    lastTabCount = tabCount; 
    tabCount++;

};




//traverse up through the menu using up arrow
Blockly.Accessibility.MenuNav.menuNavUp = function(){
    
    //remove last select if possible also remove select that gets stuck on 1 after switching directions
    if((flyoutArr[lastTabCount] != undefined && tabCount!=oldLength) || lastTabCount==oldLength+1)
    {
        flyoutArr[lastTabCount].removeSelect();
    }
    //handle loops 
    //if tabcount is too low   || In variables menu (only 2 blocks)   || In audio menu (only 1 block)        || trying to switch directions at the top of the menu
    if(tabCount <= oldLength-1 || (flyoutArr.length - oldLength == 2) || (flyoutArr.length - oldLength == 1) || (lastTabCount == tabCount-1 && tabCount-2<oldLength)){
        lastTabCount = oldLength;
        tabCount = flyoutArr.length-1;
        flyoutArr[lastTabCount].removeSelect();
    }

    //handle switching from down to up
    //normal switch scenario       && not the first block  && not in the variables menu
    if(lastTabCount == tabCount-1  && tabCount!=oldLength  && (flyoutArr.length-oldLength!=2)){
        flyoutArr[lastTabCount].removeSelect();
        tabCount-=2;
    }
    //select next -> save last -> decrease count 
    flyoutArr[tabCount].addSelect(); 
    lastTabCount = tabCount;         
    tabCount--;
};