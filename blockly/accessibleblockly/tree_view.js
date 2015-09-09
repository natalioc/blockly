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

/**
*Will set up the box so that the tree can be built into it
*/
Blockly.Accessibility.TreeView.makeTree = function() {
    //global isn't instantiated 
    console.log("Here")
    if(!this.firstRun){
  	  this.firstRun = 1;
    }
    document.getElementById("comment").innerHTML = "";
    var treeConfig = goog.ui.tree.TreeControl.defaultConfig;
    treeConfig['cleardotPath'] = './images/tree/cleardot.gif';
    tree = new goog.ui.tree.TreeControl('root', treeConfig);
    var treeData = this.addBlockComments();
    console.log(this.testData);
    console.log(treeData);
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
	comments[0] = ['Block Comments'];
	var map = Blockly.Accessibility.Prefixes.getAllPrefixes();
	var category = comments[0];
	var firstGo = 1;
	var x = 0;
	var x2 = 0;
	category[0] = 'Block Comments';
	console.log(category);
	for (var key in map) {
  		if (map.hasOwnProperty(key)) {
  			if(firstGo == 1){
	  			var currentPrefix = map[key];
	  			console.log(currentPrefix);
	  			var categoryNumber = Blockly.Accessibility.Prefixes.getNumberFromAlphabetical(currentPrefix[0]);
	  			console.log(categoryNumber);

	  			category[1] = [0];
	  			category[1][0] = [x];
	  			category[1][0][x] = currentPrefix;
	  			firstGo++;
	  			var lastPrefix = currentPrefix;
	  		}
	  		else{
	  			//this one handles indents like A1 -> A1a
	  			var currentPrefix = map[key];
	  			console.log('in the else');
	  			console.log(lastPrefix);
	  			category[1][0][x] = [0];
	  			category[1][0][x][0] = [0];
	  			category[1][0][x][0][0] = currentPrefix;
	  			category[1][0][x][1] = [0]
	  			category[1][0][x][1][0] = 'tester';
	  		}
  		}
  		x++;
	}
	console.log(category);
	this.testData = category;
	return category;
};