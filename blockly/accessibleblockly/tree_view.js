// Copyright 2010 The Closure Library Authors. All Rights Reserved.
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//      http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS-IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.
goog.provide('Blockly.Accessibility.TreeView');

var testData = [];
var $ = goog.dom.getElement;
var tree, clipboardNode;
var category = [];
var categoryIndex = '';

/**
*Will set up the box so that the tree can be built into it
*/
Blockly.Accessibility.TreeView.makeTree = function() {
    //global isn't instantiated 
    //console.log("Here")
    if(!this.firstRun){
  	  this.firstRun = 1;
    }
    document.getElementById("comment").innerHTML = "";
    var treeConfig = goog.ui.tree.TreeControl.defaultConfig;
    treeConfig['cleardotPath'] = './images/tree/cleardot.gif';
    tree = new goog.ui.tree.TreeControl('root', treeConfig);
    var treeData = this.addBlockComments();
    //console.log(this.testData);
    //console.log(treeData);
    this.createTreeFromTestData(tree, this.testData);//this.testData);
    tree.render($('comment'));
}

/**
*Creates the tree from the test data
*/
Blockly.Accessibility.TreeView.createTreeFromTestData = function(node, data) {
    node.setHtml(data[0]);
    if(data.length > 1) {
        var children = data[1];
        var childNotCollapsible = null; // Hard coded to reduce randomness.
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            var childNode = node.getTree().createNode('');
            node.add(childNode);
            this.createTreeFromTestData(childNode, child);
            if (i == childNotCollapsible && child.length > 1) {
               childNode.setIsUserCollapsible(false);
                childNode.setExpanded(true);
                nonCollapseNode = childNode;
            }
        }
    }
};

/**
* The test data from googles closure demos
*/
Blockly.Accessibility.TreeView.testDataVar = function(){
    //this.testData 
    return ['Blocks',
    		[ 
    		 ['A1', 
    		  [ 
    		   ['A1a'] ] ], ['A2', [ ['A2a'] ] ] ] ];
};

/**
*This function updates the test data for testing purposes
*/
Blockly.Accessibility.TreeView.changeData = function(){
	var testData2 = this.testData;
	var catagory = testData2[[1]];
	catagory[26] = ["ZZ", [["ZZTop"], ["ZZMiddle",[["ZZDoubleMiddle"]]],["ZZBottom"]]];
	this.testData = testData2;
	this.makeTree();

};

/**
*Function will go through all the prefixes and set up the data so that it can be
* setup as a tree
*/
Blockly.Accessibility.TreeView.addBlockComments = function(){
	//console.log(this.testData);
	var comments = [];
	var map = Blockly.Accessibility.Prefixes.getAllPrefixes();
	var initialRun = 1;
	var doubles = false;
	category[0] = 'Block Comments';
	var lastPrefix = '';
	var prevCategory = '';
	for (var key in map) {
  		if (map.hasOwnProperty(key)) {
			var currentPrefix = map[key];

			if(currentPrefix[1].match(/[a-z]/i)){
				var categoryNumber = Blockly.Accessibility.Prefixes.getNumberFromAlphabetical(currentPrefix[0] + currentPrefix[1]);
				doubles = true;
			}
			else{
				var categoryNumber = Blockly.Accessibility.Prefixes.getNumberFromAlphabetical(currentPrefix[0]);
			}
			if(initialRun == 1){
				initialRun++;
				category[1] = [0];
				category[1][0] = [0];
				category[1][0][0] = currentPrefix;
				lastPrefix = currentPrefix;
			}
			else{
				//handles going straight down if not connected ex A1, B1, C1
				//console.log(categoryNumber);
				//console.log(doubles);
				//handles prefixes that are double starters ex AA
				if(doubles == true){
					//lastPrefix.length < currentPrefix.length
				}
				else{

				}
				category[1][categoryNumber] = [0];
				category[1][categoryNumber][0] = currentPrefix;
				prevCategory = categoryNumber;
				//var foo = 1;
				//var thingsToThrowInFunction = "category[1][" + categoryNumber + "][" + foo + "]";
				//console.log(thingsToThrowInFunction);

				//this.addDepth(thingsToThrowInFunction);
			}
			/**
  			if(firstGo == 1){
	  			var currentPrefix = map[key];
	  			console.log(currentPrefix);
	  			var categoryNumber = Blockly.Accessibility.Prefixes.getNumberFromAlphabetical(currentPrefix[0]);
	  			console.log(categoryNumber);

	  			category[1] = [0];
	  			category[1][0] = [x];
	  			category[1][0][x] = currentPrefix;
	  			firstGo++;
	  			lastPrefix = currentPrefix;
	  		}
	  		else{
	  			
	  			//this one handles indents like A1 -> A1a
	  			console.log('in the else');
	  			console.log(lastPrefix);
	  			category[1][0][x] = [0];
	  			category[1][0][x][0] = [0];
	  			category[1][0][x][0][0] = currentPrefix;
	  			category[1][0][x][0][1] = [0];
	  			category[1][0][x][0][1][0] = [0];
	  			category[1][0][x][0][1][0][0] = 'deeper';
	  			category[1][0][x][1] = [0]
	  			category[1][0][x][1][0] = 'tester';
	  			//breaker
	  			category[1][1] = [0];
	  			category[1][1][0] = 'foo';
	  			lastPrefix = currentPrefix;
	  		}
	  		*/
  		}
	}
	//console.log(category);
	this.testData = category;
	return category;
};

Blockly.Accessibility.TreeView.addDepth = function(tree){
	//console.log(tree);
	var newArray = tree.slice(8, tree.length);
	eval(newArray)[1] = [0];
	var newCall = category + newArray;
	
	//console.log(newArray);
	//console.log(newCall);

};
