// demonstration file, printing path lengths and anomaly score of the whole data set - custom version of info
// data size 4, sample size 4

const { IsolationForest } = require('../index')

// data with no anomaly
const inputData = [[3, 1], [5, 2], [4, 4], [2, 3]]

const myNumberOfTrees = 30
const mySampleSize = 4

// inicializing IsolationForest
const myForest = new IsolationForest(inputData, myNumberOfTrees, mySampleSize)

// saving arrays with anomaly scores and path lengths in variables
const myAnomalyScores = myForest.dataAnomalyScore()
const myPathLengths = myForest.dataPathLength()

// custom information print
for (let i = 0; i < myForest.data.length; i++) {
  console.log('data member on index ' + i + ': value: [' + myForest.data[i] +
                '], anomaly score: ' + myAnomalyScores[i] +
                ', average path length: ' + myPathLengths[i] + '\n')
}
