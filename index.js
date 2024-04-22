// npm install lodash  for use of _.sampleSize() : https://www.geeksforgeeks.org/lodash-_-samplesize-method/
// lodash _.uniqWith() method https://www.geeksforgeeks.org/lodash-_-uniqwith-method/
// npm install graphviz

// import lodash
const _ = require('lodash');

// import graphviz (installed by: npm install graphviz)
const graphviz = require('graphviz');

// class for internal nodes
class InternalNode {
  constructor (left, right, splitAttribute, splitValue, size) {
    this.left = left; // left subtree
    this.right = right; // right subtree
    this.splitAttribute = splitAttribute; // attribute used for splitting
    this.splitValue = splitValue; // splitting value
    this.size = size; // size of the data in the internal node
  }
}

// class for external (isolated) nodes
class ExternalNode {
  constructor (size, depth) {
    this.size = size; // size of the data in the external node
    this.depth = depth; // depth of the external node in the isolation tree
  }
}

// class for isolation forest
class IsolationForest {
  constructor (data, numberOfTrees, sampleSize) {
    // checking the data if it is non empty array of arrays
    if (!Array.isArray(data) || data.length === 0 || data[0].length === 0) {
      throw new Error('IsolationForest constructor(): Invalid input, data must be non-empty array of arrays.');
    }

    // checking the data members if they are arrays of the same size
    const expectedDataDimension = data[0].length
    for (let i = 1; i < data.length; i++) {
      // check if data members are all the same dimension
      if (!Array.isArray(data[i]) || data[i].length !== expectedDataDimension) {
        throw new Error('IsolationForest constructor(): Invalid input, all data members must be arrays of the same dimension.'); //
      }
    }

    // checking the data members are unique, using _.uniqWith and _.isEqual as a comparator (lodash library)
    // compares based on content not reference
    const uniqueArray = _.uniqWith(data, _.isEqual)
    if (uniqueArray.length !== data.length) {
      throw new Error('IsolationForest constructor(): Invalid input, data members must be unique.');
    }

    // checking the number of trees to be a positive integer
    if (numberOfTrees <= 0 || !Number.isInteger(numberOfTrees)) {
      throw new Error('IsolationForest constructor(): Invalid input, number of trees must be positive integer.');
    }

    // checking sample size to be a positive integer up to the size of data
    if (sampleSize <= 0 || !Number.isInteger(sampleSize) || sampleSize > data.length) {
      throw new Error('IsolationForest constructor(): Invalid input, sample size must be positive integer up to the data size.');
    }

    this.data = data; // data to analyse
    this.numberOfTrees = numberOfTrees; // number of isolation trees to build
    this.sampleSize = sampleSize; // size of the sample of data
    this.forest = []; // array to store isolation trees

    this.heightLimit = Math.ceil(Math.log2(sampleSize)); // average tree height based on IF algorithms

    this.buildForest(); // build the isolation forest
    this.printForestInfo(); // print info about isolation forest
  }

  printForestInfo () {
    // console.log("");
    console.log('\n===============================================');
    console.log('   data size: ' + this.data.length + ', number of attributes: ' + this.data[0].length);
    console.log('-----------------------------------------------');
    console.log('   number of trees: ' + this.numberOfTrees + ', sample size: ' + this.sampleSize);
    console.log('-----------------------------------------------');
    console.log('   height limit of trees set to: ' + this.heightLimit);
    console.log('-----------------------------------------------');
    console.log('   >>>    ISOLATION FOREST CREATED    <<<');
    console.log('===============================================\n');
  }

  /// ////////// Training phase:

  // build forest (collection of trees) - called by constructor when class is initialized
  buildForest () {
    // create collection of isolation trees (given "numberOfTrees", stores them in "this.forest" array)
    for (let i = 0; i < this.numberOfTrees; i++) {
      const sampledData = this.sample(this.data, this.sampleSize);// different data sample for each tree
      const iTree = this.buildTree(sampledData);
      this.forest.push(iTree);
    }
  }

  // sample data - called by buildForest
  sample (dataToSample, sizeOfSample) {
    return _.sampleSize(dataToSample, sizeOfSample);
  }

  // build a tree - called by buildForest() method
  // input - sampled data subset
  buildTree (treeData, currentDepth = 0) {
    // if data cannot be divided further
    if (treeData.length <= 1 || currentDepth >= this.heightLimit) {
      return new ExternalNode(treeData.length, currentDepth); // create external (isolated)
    } else {
      // increment depth when entering a new level
      currentDepth++;

      const numberOfAttributes = treeData[0].length;
      let minValue; // = Infinity; // moved to the do while loop
      let maxValue;//  = -Infinity;
      let randomAttribute;

      do {
        minValue = Infinity;
        maxValue = -Infinity;

        // get a random attribute
        randomAttribute = Math.floor(Math.random() * numberOfAttributes);

        // get the minValue and maxValue values of the selected attribute
        for (let i = 0; i < treeData.length; i++) {
          if (treeData[i][randomAttribute] < minValue) {
            minValue = treeData[i][randomAttribute];
          }
          if (treeData[i][randomAttribute] > maxValue) {
            maxValue = treeData[i][randomAttribute];
          }
        }
      }
      while (minValue === maxValue); // if true: find "randomAttribute" and its min/max values again

      // get a random value (split point) of the selected random attribute
      const splitPoint = Math.random() * (maxValue - minValue) + minValue;

      // partition (filter) the data based on the split point for left and right children of the tree
      const leftData = treeData.filter(item => item[randomAttribute] < splitPoint);
      const rightData = treeData.filter(item => item[randomAttribute] >= splitPoint);

      // recursively build the left and right children - subtrees, call itself with current currentDepth
      const leftSubtree = this.buildTree(leftData, currentDepth);
      const rightSubtree = this.buildTree(rightData, currentDepth);

      // create an internal node object with left and right subtrees
      return new InternalNode(leftSubtree, rightSubtree, randomAttribute, splitPoint, treeData.length);
    }
  }

  /// ////////// Evaluation phase:

  // compute path length for a given data member and a given isolation tree
  // first called with 3 arguments, recursion called with updated "currentPathLength" argument
  pathLength (dataMember, iTree, currentPathLength = 0) {
    // if iTree is an external node, return currentPathLenght + calculateC(isoTree.size)
    if (iTree instanceof ExternalNode) {
      return currentPathLength + this.calculateC(iTree.size);
    }

    // determine the path to follow
    if (dataMember[iTree.splitAttribute] < iTree.splitValue) {
      return this.pathLength(dataMember, iTree.left, currentPathLength + 1);
    } else {
      return this.pathLength(dataMember, iTree.right, currentPathLength + 1);
    }
  }

  // calculate the c
  // input "size" is the size of the data set or subset
  calculateC (size) {
    if (size > 2) {
      return 2 * (Math.log(size - 1) + 0.5772156649) - 2 * (size - 1) / this.data.length;
    } else if (size === 2) {
      return 1;
    } else {
      return 0;
    }
  }

  // finds desired number of data members with highest anomaly scores across data, orders them and prints info
  // helper method, called by dataAnomalyScore() method
  // inputs: array with data anomaly scores, array with average data path lengths, number of highest values wanted
  maxAnomalyScores (dataScores, dataLengths, numberOfMaxValues) {
    // create shallow copy of array, changing copy does not change original the original array
    const dataScoresCopy = [...dataScores];
    const maxValuesIndexes = [];
    let currentMaxValue, currentMaxValueIndex;

    do {
      currentMaxValue = Math.max(...dataScoresCopy); // ... => spread syntax - to pass array members as individual arguments
      currentMaxValueIndex = dataScoresCopy.indexOf(currentMaxValue);
      maxValuesIndexes.push(currentMaxValueIndex);
      dataScoresCopy[currentMaxValueIndex] = -Infinity;
    }
    while (maxValuesIndexes.length < numberOfMaxValues)

    // header for "evaluation of data" info
    console.log('\n====================================================================================================================');
    console.log('                              >>>             EVALUATION OF DATA               <<<');
    console.log('--------------------------------------------------------------------------------------------------------------------');
    console.log('  ' + numberOfMaxValues + ' values with highest Anomaly Score are: ');
    console.log('--------------------------------------------------------------------------------------------------------------------');

    // print info about desired number of highest anomaly score members of data (their index, score, path length and value)
    for (let i = 0; i < numberOfMaxValues; i++) {
      console.log('| Index of data: ' + maxValuesIndexes[i] +
                        ' \t| anomaly Score: ' + dataScores[maxValuesIndexes[i]] +
                        ' \t| path length: ' + dataLengths[maxValuesIndexes[i]] +
                        ' \t| data value: [' + this.data[maxValuesIndexes[i]] + ']');
    }
    console.log('====================================================================================================================');
  }

  // calculate average path lenthgs for all data members over all isolation trees
  dataPathLength () {
    // let maxHeight = this.sampleSize - 1;    // for normal usage, maybe make it a parameter so it can be set by user ????
    let totalLengths = 0;

    const averagePathLenghts = []; // array to store average path lenthg for each data member

    // loop through the data
    for (let i = 0; i < this.data.length; i++) {
      // loop through the isolation trees
      for (let j = 0; j < this.forest.length; j++) {
        totalLengths += this.pathLength(this.data[i], this.forest[j]); // get the path lengths
      }
      averagePathLenghts.push(totalLengths / this.forest.length); // calculate average path an push into array
      totalLengths = 0; // reset the total path length for next data member
    }
    // this.minPathLengths(averagePathLenghts, 10);
    return averagePathLenghts; // or better to console.log(averagePathLengths); ???
  }

  // calculate anomaly score for all data members
  dataAnomalyScore (numberOfAnomalies = 0) {
    // checking if numberOfAnomalies is an integer greater or equal to 0 and up to the data size
    if (numberOfAnomalies < 0 || numberOfAnomalies > this.data.length || !Number.isInteger(numberOfAnomalies)) {
      throw new Error('dataAnomalyScore(): Invalid input, number of anomalies must be non-negative integer up to the data size.');
    }

    const dataAveragePath = this.dataPathLength(); // get the average pathh lenghts for all data
    const cValue = this.calculateC(this.sampleSize); // get the c value

    const dataAnomalyScores = []; // array to store anomaly score for each data member

    // loop through the average path lengths
    for (let i = 0; i < dataAveragePath.length; i++) {
      dataAnomalyScores.push(2 ** (((-1) * dataAveragePath[i]) / cValue));
    }
    if (numberOfAnomalies > 0) {
      this.maxAnomalyScores(dataAnomalyScores, dataAveragePath, numberOfAnomalies);
    }
    return dataAnomalyScores; //   or better to console.log(dataAnomalyScores); ???
  }

  /// ////////// Visualisation:

  // build graph using npm graphviz
  // inputs: graphviz graph, root node of the tree, default nodeIdCounter set to zero
  // method only ever called only with two arguments, called by exportTree() and printDotString() methods
  buildGraph (graph, treeNode, nodeIdCounter = 0) {
    // helper function to recursively traverse the tree and build the graph
    function recursiveBuild (treeNode) {
      if (treeNode instanceof InternalNode) {
        const internalNodeId = nodeIdCounter++; // assign id to internal node

        const internalNode = graph.addNode(internalNodeId.toString()); // add internal node to the graph

        // add information and shape to the internal node
        internalNode.set('label', `Attribute: ${treeNode.splitAttribute}\\nSplit Value:\\n ${treeNode.splitValue} \\n Size: ${treeNode.size}`);
        internalNode.set('shape', 'box');

        // recursive calls to traverse tree
        const leftNodeId = recursiveBuild(treeNode.left);
        const rightNodeId = recursiveBuild(treeNode.right);

        // add edges between internal node and its child nodes
        graph.addEdge(internalNodeId.toString(), leftNodeId.toString());
        graph.addEdge(internalNodeId.toString(), rightNodeId.toString());

        return internalNodeId // return internal node id
      } else if (treeNode instanceof ExternalNode) {
        const externalNodeId = nodeIdCounter++; // assign id to external node

        const externalNode = graph.addNode(externalNodeId.toString()) // add external node to graph

        // add information, shape and frame width to external node
        externalNode.set('label', `Depth: ${treeNode.depth}\\nSize: ${treeNode.size} `);
        externalNode.set('shape', 'box');
        externalNode.set('penwidth', 3.0); // default 1.0, minimum 0.0

        return externalNodeId; // return external node id
      }
    }
    return recursiveBuild(treeNode); // start the recursive travesal of the tree by calling helper function
  }

  // export a given tree using inputs: format and file name
  // produce a file
  exportTree (treeToExport, exportFormat, fileName, exportInfo = true) {
  // ?? change it so you enter myForest and 0, instead  of myForest.forest[0] ???

    // checking if tree on input is a tree (has InternalNode as constructor and is in the forest array)
    // is it undefined? (catches out of boundaries of forest array)
    // is it not constructed with InternalNode (catches random inputs like strings and numbers)
    if (treeToExport === undefined || treeToExport.constructor !== InternalNode) {
      throw new Error('exportTree(): Invalid input, tree for export must be an IF tree, within the boundaries of the forest array.');
    }

    // checking if exportFormat is a string
    if (typeof exportFormat !== 'string') {
      throw new Error('exportTree(): Invalid input, output format must be a string and one of the Graphviz supported formats.');
    }

    // checking if fileName is a string
    if (typeof fileName !== 'string') {
      throw new Error('exportTree(): Invalid input, name of output file must be a string.');
    }

    // checking if exportInfo is a boolean
    if (typeof exportInfo !== 'boolean') {
      throw new Error('exportTree(): Invalid input, exportInfo must be a boolean.');
    }

    // create a new graph using npm graphviz
    const exportGraph = graphviz.digraph('G');

    // in case user used capitals for format
    const lowerCaseFormat = exportFormat.toLowerCase();

    // call a helper function to recursively build the graph
    this.buildGraph(exportGraph, treeToExport);

    // build the whole file name => add the file name and extension
    // say in documentation that path is case sensitive
    const fileNameWithExtention = fileName + '.' + lowerCaseFormat;

    // output the graph through npm graphviz
    exportGraph.output(lowerCaseFormat, fileNameWithExtention);

    // if inputs will be changed, print also number of the tree exported
    // print to the console that a tree was exported into what format (true if exportTree not called by exportForest() )
    if (exportInfo) {
      console.log('\n   Exported a tree into ' + fileNameWithExtention + ' file.\n');
    }
  }

  // exports the whole forest at once
  // produces a file for each isolation tree using the "exportTree" method
  // input file name can include the existing folder in the project folder ("img/exampleName")
  exportForest (forestExportFormat, fileName) {
    // make accepted formats a class variable for both exportTree and exportForest ???
    // checking if forestExported format is string
    if (typeof forestExportFormat !== 'string') {
      throw new Error('exportForest: Invalid input, output format must be a string and one of the Graphviz supported formats.');
    }

    // checking if fileName is a string
    if (typeof fileName !== 'string') {
      throw new Error('exportForest(): Invalid input, name of output file must be a string.');
    }

    // loops through the isolation trees and exports them
    for (let i = 0; i < this.forest.length; i++) {
      // adds the index of the tree (from the "this.forest" array) as part of the file name
      const treeFileName = fileName + i.toString();

      // calls the "exportTree" method for each tree
      this.exportTree(this.forest[i], forestExportFormat, treeFileName, false); // false for not printing the info about each of many exported trees
    }
    console.log('\n   Exported Isolation Forest into "' + forestExportFormat + '" format.\n'); // prints what format the IF was exported into
  }
} // end of IsolationForest class

// exporting classes
module.exports = {
  IsolationForest,
  ExternalNode
}
