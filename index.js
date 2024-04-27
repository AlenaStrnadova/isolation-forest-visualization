/**
 * This library requires npm packages
 * {@link https://www.npmjs.com/package/lodash|lodash} and
 * {@link https://www.npmjs.com/package/graphviz|graphviz}
 * To install required packages run: "npm install graphviz" and "npm install lodash"
 * @requires lodash
 * @requires graphviz
 */

// import lodash
const _ = require('lodash');

// import graphviz (installed by: npm install graphviz)
const graphviz = require('graphviz');

/**
 * Class for internal nodes,
 * internal nodes have two child nodes.
 * @class
 */
class InternalNode {
  /**
   * Create an internal node
   * @param {InternalNode|ExternalNode} left - Left subtree
   * @param {InternalNode|ExternalNode} right - Right subtree
   * @param {number} splitAttribute - Attribute used for splitting
   * @param {number} splitValue - Splitting value
   * @param {number} size - Size of the data in the internal node
   */
  constructor (left, right, splitAttribute, splitValue, size) {
    this.left = left;
    this.right = right;
    this.splitAttribute = splitAttribute;
    this.splitValue = splitValue;
    this.size = size;
  }
}

/**
 * Class for external (leaf) nodes.
 * @class
 */
class ExternalNode {
  /**
   * Create an external node
   * @param {number} size - Size of the data in the external node
   * @param {number} depth - Depth of the external node in the isolation tree
   */
  constructor (size, depth) {
    this.size = size;
    this.depth = depth;
  }
}

/**
 * Class for isolation forest,
 * includes methods for creating isolation forest, evaluation of anomalies and visualization.
 * @class
 */
class IsolationForest {
  /**
   * Create an isolation forest,
   * constructor calls methods buildForest() and printForestInfo().
   * @param {Array} data - Data to analyze
   * @param {number} numberOfTrees - Number of isolation trees to build
   * @param {number} sampleSize - Size of the sample of data
   */
  constructor (data, numberOfTrees, sampleSize) {
    // Error handling: checking input data to be a non empty array of arrays
    if (!Array.isArray(data) || data.length === 0 || data[0].length === 0) {
      throw new Error('IsolationForest constructor(): Invalid input, data must be non-empty array of arrays.');
    }

    // Error handling: checking the data members to be arrays of the same size, using lodash method _.some
    const expectedDataDimension = data[0].length
    if (_.some(data, (x) => {return x.length != expectedDataDimension})) {
      throw new Error('IsolationForest constructor(): Invalid input, all data members must be arrays of the same dimension.'); //
    }

    // Error handling: checking the data members to be unique 
    // using lodash methods, compares based on content not reference
    const uniqueArray = _.uniqWith(data, _.isEqual)
    if (uniqueArray.length !== data.length) {
      throw new Error('IsolationForest constructor(): Invalid input, data members must be unique.');
    }

    // Error handling: checking the number of trees to be a positive integer
    if (numberOfTrees <= 0 || !Number.isInteger(numberOfTrees)) {
      throw new Error('IsolationForest constructor(): Invalid input, number of trees must be positive integer.');
    }

    // Error handling: checking sample size to be a positive integer up to the size of data
    if (sampleSize <= 0 || !Number.isInteger(sampleSize) || sampleSize > data.length) {
      throw new Error('IsolationForest constructor(): Invalid input, sample size must be positive integer up to the data size.');
    }

    this.data = data;
    this.numberOfTrees = numberOfTrees;
    this.sampleSize = sampleSize;
    this.forest = []; // array to store a created collection of isolation trees

    // average tree height based on IF algorithms
    // used to stop recursion in the buildTree() method
    this.heightLimit = Math.ceil(Math.log2(sampleSize));

    this.buildForest(); // build the isolation forest and store it in this.forest array
    this.printForestInfo(); // print info about isolation forest
  }

  /**
   * Print information about the isolation forest.
   */
  printForestInfo () {
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

  // >>>>>>>>>>>>> TRAINING PHASE (creating Isolation Forest) <<<<<<<<<<<<<

  /**
   * Build forest (collection of trees) - called by constructor when class is initialized.
   */
  buildForest () {
    for (let i = 0; i < this.numberOfTrees; i++) {
      const sampledData = this.sample(this.data, this.sampleSize);// different data sample for each tree
      const iTree = this.buildTree(sampledData);
      this.forest.push(iTree);
    }
  }

  /**
   * Sample data - called by buildForest() method,
   * using lodash method _.sampleSize.
   * @param {Array} dataToSample - Data to sample
   * @param {number} sizeOfSample - Size of the sample
   * @returns {Array} Sampled data
   */
  sample (dataToSample, sizeOfSample) {
    return _.sampleSize(dataToSample, sizeOfSample);
  }

  /**
   * Build a tree - called by buildForest() method.
   * @param {Array} treeData - Sampled data subset
   * @param {number} [currentDepth=0] - Current depth of the tree
   * @returns {InternalNode} Built tree
   */
  buildTree (treeData, currentDepth = 0) {
    // if data cannot be divided further or height limit is reached
    if (treeData.length <= 1 || currentDepth >= this.heightLimit) {
      return new ExternalNode(treeData.length, currentDepth); // create external node
    } else {
      currentDepth++;
      const numberOfAttributes = treeData[0].length;
      let minValue;
      let maxValue;
      let randomAttribute;

      do {
        // get a random attribute
        randomAttribute = Math.floor(Math.random() * numberOfAttributes);

        // find min and max values of given attribute, using lodash methods _.minBy and _.maxBy
        minValue = _.minBy(treeData, dataMember => dataMember[randomAttribute])[randomAttribute];
        maxValue = _.maxBy(treeData, dataMember => dataMember[randomAttribute])[randomAttribute];
      }
      while (minValue === maxValue); // when true: find "randomAttribute" and its min/max values again

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

  // >>>>>>>>>>>>> EVALUATION PHASE (evaluating data for anomalies) <<<<<<<<<<<<<

  /**
   * Compute path length for a given data member and a given isolation tree,
   * first called with 2 arguments and default currentPathLength = 0, 
   * recursive calls with updated currentPathLength.
   * @param {Array} dataMember - Data member
   * @param {InternalNode} iTree - Isolation tree
   * @param {number} [currentPathLength=0] - Current path length
   * @returns {number} Path length
   */
  pathLength (dataMember, iTree, currentPathLength = 0) {
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

  /**
   * Calculate the c value.
   * @param {number} size - Size of the data set or subset
   * @returns {number} Computed c value
   */
  calculateC (size) {
    if (size > 2) {
      return 2 * (Math.log(size - 1) + 0.5772156649) - 2 * (size - 1) / this.data.length;
    } else if (size === 2) {
      return 1;
    } else {
      return 0;
    }
  }

  /**
   * Find desired number of data members with highest anomaly scores across data, 
   * orders them and prints info, 
   * called by dataAnomalyScore() method.
   * @param {Array} dataScores - Array with data anomaly scores
   * @param {Array} dataLengths - Array with average data path lengths
   * @param {number} numberOfMaxValues - Number of highest anomaly scores values wanted
   */
  maxAnomalyScores (dataScores, dataLengths, numberOfMaxValues) {
    // create shallow copy of array, changing copy does not change the original array
    const dataScoresCopy = [...dataScores];
    const maxValuesIndexes = [];
    let currentMaxValue, currentMaxValueIndex;

    do {
      // ... spread syntax -> to pass array members as individual arguments
      currentMaxValue = Math.max(...dataScoresCopy);
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

  /**
   * Calculate average path lengths for all data members over all isolation trees.
   * @returns {Array} Average path lengths for each data member
   */
  dataPathLength () {
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

    return averagePathLenghts;
  }

  /**
   * Calculate anomaly score for all data members,
   * if called with numberOfAnomalies > 0, then call maxAnomalyScores() - evaluation of data.
   * @param {number} [numberOfAnomalies=0] - Number of anomalies
   * @returns {Array} Anomaly scores for each data member
   */
  dataAnomalyScore (numberOfAnomalies = 0) {
    // Error handling: checking if numberOfAnomalies is an non negative integer and up to the data size
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
    // if numberOfAnomalies > 0, then call maxAnomalyScore() method - evaluation of data
    if (numberOfAnomalies > 0) {
      this.maxAnomalyScores(dataAnomalyScores, dataAveragePath, numberOfAnomalies);
    }
    return dataAnomalyScores;
  }

  // >>>>>>>>>>>>> VISUALIZATION <<<<<<<<<<<<<

  /**
   * Build graph, using graphviz methods,
   * called by exportTree() method.
   * @param {*} graph - Graphviz graph
   * @param {InternalNode} treeNode - Root node of the tree
   * @param {number} [nodeIdCounter=0] - Default nodeIdCounter set to zero
   * @returns {*} Graph
   */
  buildGraph (graph, treeNode, nodeIdCounter = 0) {
    // helper function to recursively traverse the tree and build the graph
    function recursiveBuild (treeNode) {
      if (treeNode instanceof InternalNode) {
        const internalNodeId = nodeIdCounter++; // assign ID to internal node

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

        return internalNodeId // return internal node ID
      } else if (treeNode instanceof ExternalNode) {
        const externalNodeId = nodeIdCounter++; // assign ID to external node

        const externalNode = graph.addNode(externalNodeId.toString()) // add external node to graph

        // add information, shape and frame width to external node
        externalNode.set('label', `Depth: ${treeNode.depth}\\nSize: ${treeNode.size} `);
        externalNode.set('shape', 'box');
        externalNode.set('penwidth', 3.0); // default 1.0, minimum 0.0

        return externalNodeId; // return external node ID
      }
    }
    return recursiveBuild(treeNode); // start the tree travesal by calling helper function
  }

  /**
   * Export a given tree, produce a file.
   * @param {InternalNode} treeToExport - Tree to export
   * @param {string} exportFormat - Format of the exported file
   * @param {string} fileName - Name of the output file - can include folder name ("img/tree")
   * @param {boolean} [exportInfo=true] - Indicates whether to print export info
   */
  exportTree (treeToExport, exportFormat, fileName, exportInfo = true) {
    // Error handling: checking tree on input to be a tree (has InternalNode as constructor)
    if (treeToExport === undefined || treeToExport.constructor !== InternalNode) {
      throw new Error('exportTree(): Invalid input, tree for export must be an IF tree, within the boundaries of the forest array.');
    }

    // Error handling: checking exportFormat to be a string
    if (typeof exportFormat !== 'string') {
      throw new Error('exportTree(): Invalid input, output format must be a string and one of the Graphviz supported formats.');
    }

    // Error handling: checking fileName to be a string
    if (typeof fileName !== 'string') {
      throw new Error('exportTree(): Invalid input, name of output file must be a string.');
    }

    // Error handling: checking exportInfo to be a boolean
    if (typeof exportInfo !== 'boolean') {
      throw new Error('exportTree(): Invalid input, exportInfo must be a boolean.');
    }

    // create a new graph using npm graphviz
    const exportGraph = graphviz.digraph('G');

    const lowerCaseFormat = exportFormat.toLowerCase();

    // call a helper method to recursively build the graph
    this.buildGraph(exportGraph, treeToExport);

    // build the whole file name => add the file name and extension
    const fileNameWithExtention = fileName + '.' + lowerCaseFormat;

    // output the graph through graphviz output() method
    exportGraph.output(lowerCaseFormat, fileNameWithExtention);

    // if exportInfo === true (method not called by exportForest()), then print info a about tree export
    if (exportInfo) {
      console.log('\n   Exported a tree into ' + fileNameWithExtention + ' file.\n');
    }
  }

  /**
   * Export entire forest,
   * produce a file for each tree, file name includes index of the tree.
   * @param {string} forestExportFormat - Format of the exported file
   * @param {string} fileName - Name of the output file, can include folder name ("img/forest")
   */
  exportForest (forestExportFormat, fileName) {
    // Error handling: checking forestExportFormat to be a string
    if (typeof forestExportFormat !== 'string') {
      throw new Error('exportForest: Invalid input, output format must be a string and one of the Graphviz supported formats.');
    }

    // Error handling: checking fileName to be a string
    if (typeof fileName !== 'string') {
      throw new Error('exportForest(): Invalid input, name of output file must be a string.');
    }

    // loops through the isolation trees and exports them
    for (let i = 0; i < this.forest.length; i++) {
      // adds the index of the tree (from the "this.forest" array) to the file name
      const treeFileName = fileName + i.toString();

      // calls the "exportTree()" method for each tree
      this.exportTree(this.forest[i], forestExportFormat, treeFileName, false); // false to not print the info about each of many exported trees
    }
    // prints what format the IF was exported into
    console.log('\n   Exported Isolation Forest into "' + forestExportFormat + '" format.\n');
  }
} // end of IsolationForest class

// exporting classes
module.exports = {
  IsolationForest,
  InternalNode,
  ExternalNode
}
