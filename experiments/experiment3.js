// demonstration file, exporting a tree, evaluating data
// data size 10, sample size 6

const { IsolationForest } = require('../index')

// data with 4 parametres
// data member on index 0 is most probable anomaly
const inputData = [[5, 6, 5, 8], [3, 1, 0, 3], [5, 2, 1, 4], [4, 4, 5, 2], [2, 3, 2, 0],
  [3, 1, 3, 1], [4, 1, 0, 4], [2, 4, 3, 2], [4, 2, 5, 2], [3, 1, 1, 3]]

const myNumberOfTrees = 100
const mySampleSize = 6

// inicializing IsolationForest
const myForest = new IsolationForest(inputData, myNumberOfTrees, mySampleSize)

// exporting a tree from forest array, on index 0
myForest.exportTree(myForest.forest[0], 'png', 'img/treeExperiment3')

// evaluating data, asking for 10 most probable anomalies => the whole data set will be ordered by anomaly score
myForest.dataAnomalyScore(10)
