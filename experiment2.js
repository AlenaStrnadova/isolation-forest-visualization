// demonstration file, exporting a tree and evaluating data
// data size 256, sample size 100

const { IsolationForest } = require('./index');

// data member on index 0 is an anomaly
const inputData =
[[10.0, 10.0], [1.58, 1.04], [3.06, 3.69], [2.65, 2],
  [2.23, 3.89], [3.62, 3.55], [3.99, 2.94], [3.78, 1.12],
  [3.57, 1.18], [2.83, 1.32], [1.49, 2.21], [1.96, 3.25],
  [3.24, 2.98], [3.42, 3.46], [2.72, 2.5], [3.26, 3.57],
  [3.51, 3.57], [3.2, 1.01], [1.14, 3.8], [1.92, 3.35],
  [2.28, 2.84], [3.63, 1.96], [1.56, 2.37], [3.11, 2.06],
  [3.64, 4], [3.73, 2.82], [2.29, 2.26], [3.87, 1.87],
  [1.76, 2.85], [3.08, 3.56], [2.71, 3.97], [2.06, 2.32],
  [2.2, 3.08], [3.27, 1.9], [2.62, 1.29], [2.09, 1.91],
  [2.68, 1.86], [3.78, 2.81], [2.54, 3.08], [3.62, 3.42],
  [1.66, 3.72], [1.29, 1.13], [2.04, 1.62], [2.49, 1.28],
  [3.62, 1.57], [3.75, 1.87], [2.54, 2.46], [1.11, 3.48],
  [3.07, 2.26], [1.49, 1.84], [2.2, 3.33], [1.43, 2.99],
  [2.4, 2.94], [3.64, 2.59], [1.98, 3.11], [1.76, 2.08],
  [2.38, 3.35], [2.08, 2.13], [3.44, 3.15], [1.42, 1.47],
  [1.33, 1.46], [1.72, 2.43], [3.47, 2.06], [3.87, 3.63],
  [3.39, 1.84], [3.74, 2.19], [2.87, 2.98], [3.9, 1.05],
  [1.85, 2.94], [3.41, 2.28], [2.64, 2.73], [2.29, 1.25],
  [1.16, 2.14], [1.41, 3.66], [1.58, 1.02], [2.65, 3.29],
  [2.43, 1.55], [3.5, 3.77], [1.47, 2.74], [3, 3.22],
  [3.79, 1.12], [1.47, 1.93], [3.07, 3.11], [1.7, 1.61],
  [1.19, 1.57], [1.7, 3.41], [1.42, 2.59], [1.48, 3.62],
  [3.21, 1.58], [2.69, 1.98], [2.77, 1.01], [3.99, 1.42],
  [3.17, 3.74], [3.63, 1.37], [3.77, 3.39], [3.57, 2.26],
  [2.91, 1.59], [3.86, 3.82], [1.8, 3.21], [2.57, 2.4],
  [1.97, 2.98], [3.9, 1.14], [1.33, 1.21], [3.84, 3.16],
  [2.66, 1.1], [1.11, 1.91], [1.32, 3.53], [3.7, 1.54],
  [1.17, 2.52], [2.52, 3.01], [2.34, 2.82], [3.53, 2.39],
  [1.21, 2.98], [2.87, 1.65], [3.42, 1.7], [2.65, 1.78],
  [3.09, 1.82], [3.22, 1.42], [3.97, 3.35], [2.62, 2.61],
  [3.79, 3.85], [1.25, 3.94], [2.64, 3.88], [2.03, 3.37],
  [3.93, 2.96], [3.56, 2.71], [3.14, 1.3], [2.45, 2.08],
  [2.43, 3.06], [3.4, 3.87], [2.33, 2.69], [3.03, 1.41],
  [3.68, 3.16], [1.41, 2.36], [2.78, 2.53], [1.42, 2.66],
  [3.84, 2.12], [3.06, 3.13], [2.14, 3.65], [1.36, 1.39],
  [2.68, 1.38], [1.53, 2.34], [1.78, 1.6], [3.83, 3.46],
  [3.96, 2.25], [2.57, 3.62], [3.22, 2.19], [3.18, 1.96],
  [2.94, 3.74], [2.61, 3.23], [1.81, 1.78], [2.96, 1.85],
  [3.57, 3.98], [3.24, 2.16], [3.21, 2.55], [3.83, 1.02],
  [3.95, 1.3], [1.12, 3.59], [1.09, 2.7], [3.43, 2.34],
  [1.1, 3.48], [1.07, 1.95], [1.07, 1.72], [3.87, 3.95],
  [1.64, 3.35], [2.22, 2.04], [1.93, 1.86], [2.75, 3.28],
  [1.58, 2.87], [2.55, 3.53], [1.95, 2.18], [3.43, 2.61],
  [2.33, 1.49], [3.43, 1.76], [1.17, 1.83], [2.09, 1.46],
  [3.33, 3.7], [1.27, 3.02], [3.48, 2.3], [2.82, 1.84],
  [1.08, 2.56], [2.53, 2.53], [3.82, 3.75], [1.8, 3.61],
  [3.14, 3.52], [3.9, 1.93], [1.51, 1.23], [3, 3.08],
  [2.78, 1.07], [3.89, 2.24], [2.71, 3.56], [1.79, 1.69],
  [1.91, 1.41], [1.79, 1.94], [3.08, 1.58], [2.51, 2.97],
  [2.62, 3.55], [2.92, 3.81], [1.27, 1.32], [3.07, 2.22],
  [2.27, 2.25], [1.29, 2.52], [2.06, 1.92], [2.98, 3.34],
  [2.94, 2.58], [3.81, 2.27], [2.55, 2.51], [2.05, 3.36],
  [1.88, 1.64], [3.67, 2.06], [1.99, 3.44], [3.43, 1.8],
  [2.89, 1.63], [3.2, 3.88], [2.62, 3.76], [2.66, 3.74],
  [2.77, 3.09], [2.74, 1.72], [2.52, 2.58], [1.21, 2.99],
  [1.82, 3.19], [1.09, 3.06], [2.55, 3.99], [2.35, 2.21],
  [2.61, 3.51], [2.75, 2.43], [1.01, 1], [2.9, 3.78],
  [1.68, 1.39], [3.96, 1.92], [2.39, 3.34], [2.06, 3.85],
  [1.79, 2.77], [3.25, 3.56], [2.58, 3.56], [3.36, 3.48],
  [3.46, 1.87], [1.71, 1.75], [3.64, 1.47], [1.21, 1.69],
  [3.02, 2.55], [2.12, 1.13], [1.47, 1.14], [3.27, 1.87],
  [1.21, 2.82], [1.63, 1.82], [3.7, 3.42], [1.55, 3.71],
  [2.43, 1.67], [1.84, 3.46], [1.4, 3.07], [3.4, 3.82],
  [1.31, 2.89], [3.47, 2.98], [2.64, 2.36], [2.74, 2.97]]

const myNumberOfTrees = 100;
const mySampleSize = 100;

// inicializing IsolationForest
const myForest = new IsolationForest(inputData, myNumberOfTrees, mySampleSize);

// exporting a tree from forest array, on index 0
myForest.exportTree(myForest.forest[0], 'png', 'img/treeExperiment2');

// evaluating data, asking for 5 most probable anomalies
myForest.dataAnomalyScore(5);
