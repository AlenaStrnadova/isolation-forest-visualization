// demonstration file, exporting a tree and the whole forest
// data size 16, sample size 10

const { IsolationForest } = require('./index')

// data member on index 0 is an anomaly
const inputData = [[4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
  [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
  [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
  [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]]

const myNumberOfTrees = 5
const mySampleSize = 10

// inicializing IsolationForest
const myForest = new IsolationForest(inputData, myNumberOfTrees, mySampleSize)

// exporting a single tree on index 0 of the forest array
myForest.exportTree(myForest.forest[0], 'png', 'img/treeExperiment1')

// exporting all trees in myForest, index of each tree is added to the file name
myForest.exportForest('png', 'img/forestExperiment')

// exported images img/treeExperiment1 and img/forestExperiment0 will be indentical
