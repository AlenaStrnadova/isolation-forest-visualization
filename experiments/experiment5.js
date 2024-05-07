// demonstration file, exporting a tree in different formats
// data size 16, sample size 10

const { IsolationForest } = require('../index')

// data member on index 0 is an anomaly
const inputData = [[4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
  [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
  [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
  [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]]

const myNumberOfTrees = 5
const mySampleSize = 10

// inicializing IsolationForest
const myForest = new IsolationForest(inputData, myNumberOfTrees, mySampleSize)

// exporting a tree into png format
myForest.exportTree(myForest.forest[0], 'png', 'img/exportExperiment')

// exporting a tree into bmp format
myForest.exportTree(myForest.forest[0], 'bmp', 'img/exportExperiment')

// exporting a tree into dot format
myForest.exportTree(myForest.forest[0], 'dot', 'img/exportExperiment')

// exporting a tree into gif format
myForest.exportTree(myForest.forest[0], 'gif', 'img/exportExperiment')

// exporting a tree into jpeg format
myForest.exportTree(myForest.forest[0], 'jpeg', 'img/exportExperiment')

// exporting a tree into jpg format
myForest.exportTree(myForest.forest[0], 'jpg', 'img/exportExperiment')

// exporting a tree into pdf format
myForest.exportTree(myForest.forest[0], 'pdf', 'img/exportExperiment')

// exporting a tree into svg format
myForest.exportTree(myForest.forest[0], 'svg', 'img/exportExperiment')

// exporting a tree into tif format
myForest.exportTree(myForest.forest[0], 'tif', 'img/exportExperiment')

// exporting all trees in myForest into different formats
myForest.exportForest('png', 'img/forestExportExperiment')
myForest.exportForest('bmp', 'img/forestExportExperiment')
myForest.exportForest('dot', 'img/forestExportExperiment')
myForest.exportForest('gif', 'img/forestExportExperiment')
myForest.exportForest('jpeg', 'img/forestExportExperiment')
myForest.exportForest('jpg', 'img/forestExportExperiment')
myForest.exportForest('pdf', 'img/forestExportExperiment')
myForest.exportForest('svg', 'img/forestExportExperiment')
myForest.exportForest('tif', 'img/forestExportExperiment')
