const _ = require('lodash');
const fs = require('fs');
const graphviz = require('graphviz');
const { IsolationForest, InternalNode, ExternalNode } = require('../index');

describe('Isolation Forest - testing initialisation based on input', () => {
  let myForest;

  const testingData = [
    [4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
    [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
    [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
    [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]
  ];

  testingNumberOfTrees = 3;
  testingSampleSize = 6;

  beforeEach(() => {
    myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);
  });

  // testing the initialisation happened correctly

  test('data class variable should be equal to testingData', () => {
    expect(myForest.data).toEqual(testingData);
  });

  test('numberOfTrees class variable should be equal to testingNumberOfTrees', () => {
    expect(myForest.numberOfTrees).toBe(testingNumberOfTrees);
  });

  test('sampleSize class variable should be equal to testingSampleSize', () => {
    expect(myForest.sampleSize).toBe(testingSampleSize);
  });

  test('length of forest class variable (array) should be equal to testingNumberOfTrees', () => {
    expect(myForest.forest).toHaveLength(testingNumberOfTrees);
  });

  // loop through all trees in the forest
  test('root node of a tree should be an instance of class InternalNode', () => {
    for (let i = 0; i < myForest.forest.length; i++) {
      expect(myForest.forest[i].constructor.name).toBe('InternalNode');
    }
  });

  // loop through all trees in the forest
  test('for each internal node, its size should be equal to sum of its child node sizes', () => {
    const internalNodeSizeTest = (treeNode) => {
      if (treeNode instanceof ExternalNode) {
        return;
      }

      expect(treeNode.size).toBe(treeNode.left.size + treeNode.right.size);

      internalNodeSizeTest(treeNode.left);
      internalNodeSizeTest(treeNode.right);
    }
    for (let i = 0; i < myForest.forest.length; i++) {
      internalNodeSizeTest(myForest.forest[i]);
    }
  });

  // loop through all trees in the forest
  test('sum of sizes of all external nodes in a tree should be equal to sampleSize', () => {
    let sizeCounter = 0;
    const externalNodeSizeTest = (treeNode) => {
      if (treeNode instanceof ExternalNode) {
        sizeCounter += treeNode.size;
        return;
      }
      externalNodeSizeTest(treeNode.left);
      externalNodeSizeTest(treeNode.right);
      return sizeCounter;
    }
    for (let i = 0; i < myForest.forest.length; i++) {
      expect(externalNodeSizeTest(myForest.forest[i])).toBe(myForest.sampleSize);
      sizeCounter = 0; // reset the counter
    }
  });

  test('heightLimit class variable should be equal to Math.ceil(Math.log2(testingSampleSize))', () => {
    expect(myForest.heightLimit).toBe(Math.ceil(Math.log2(testingSampleSize)));
  })
});

describe('Isolation Forest - testing methods', () => {
  let myForest;

  const testingData = [
    [4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
    [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
    [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
    [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]
  ];

  const testingNumberOfTrees = 3;
  const testingSampleSize = 6;

  beforeEach(() => {
    myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);
  });

  test('sample method should return array of the correct size', () => {
    const sampleSize = 3;
    const sampledData = myForest.sample(testingData, sampleSize);

    expect(sampledData).toHaveLength(sampleSize);
  });

  test('sample method should return randomly selected samples', () => {
    const sampledData1 = myForest.sample(testingData, 3);
    const sampledData2 = myForest.sample(testingData, 3);
    const sampledData3 = myForest.sample(testingData, 3);

    expect(sampledData1).not.toEqual(sampledData2);
    expect(sampledData1).not.toEqual(sampledData3);
    expect(sampledData2).not.toEqual(sampledData3);
  });

  test('calculateC method should return correct value', () => {
    expect(myForest.calculateC(0)).toBe(0);
    expect(myForest.calculateC(1)).toBe(0);
    expect(myForest.calculateC(2)).toBe(1);
    expect(myForest.calculateC(3)).toBeCloseTo(2.2907, 4);
    expect(myForest.calculateC(8)).toBeCloseTo(4.1713, 4);
    expect(myForest.calculateC(16)).toBeCloseTo(4.6955, 4);
  });

  // 0 < s ≤ 1
  test('dataAnomalyScore method should return array of corect length with values higher than 0, up to 1', () => {
    const anomalyScores = myForest.dataAnomalyScore();

    expect(anomalyScores).toHaveLength(testingData.length);
    anomalyScores.forEach(value => {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(1);
    });
  });

  // 0 < h(x) ≤ ψ − 1
  test('dataPathLength method should return array of corect length with values higher than 0 up to (sampleSize − 1)', () => {
    const pathLengths = myForest.dataPathLength();

    expect(pathLengths).toHaveLength(testingData.length);
    pathLengths.forEach(value => {
      expect(value).toBeGreaterThan(0);
      expect(value).toBeLessThanOrEqual(myForest.sampleSize - 1);
    });
  });

  // returned arrays ordered by highest score/shortest path => same order?
  test('dataPathLength and dataAnomalyScore methods, compare ordered arrays', () => {
    const pathLengths = myForest.dataPathLength();
    const anomalyScores = myForest.dataAnomalyScore();
    const combinedArray = _.zipWith(pathLengths, anomalyScores, (value1, value2) => [value1, value2]);
    const sortedByPath = _.cloneDeep(combinedArray);
    const sortedByScore = _.cloneDeep(combinedArray);
    sortedByPath.sort((a, b) => a[0] - b[0]); // sort based on pathLengths ascending
    sortedByScore.sort((a, b) => b[1] - a[1]); // sort base on anomalyScores descending

    expect(pathLengths).toHaveLength(testingData.length);
    expect(_.isEqual(sortedByPath, sortedByScore)).toBe(true);
  });

  test('exportTree method should create a file', (done) => {
    const fileName = 'testTreeExport';
    const exportFormat = 'png';
    const filePath = (fileName + '.' + exportFormat);
    myForest.exportTree(myForest.forest[0], exportFormat, fileName);

    setTimeout(() => {
      expect(fs.existsSync(filePath)).toBe(true);
      fs.unlinkSync(filePath) // delete the file
      done(); // test complete
    }, 1000); // timeout for deletion
  }, 2000); // timeout for evaluation of the whole test
});

describe('Isolation Forest - testing evaluation of data', () => {
  let myForest;

  // 256 member data, index 0 is anomaly
  const testingData =
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
  [1.31, 2.89], [3.47, 2.98], [2.64, 2.36], [2.74, 2.97]];

  const testingNumberOfTrees = 100;
  const testingSampleSize = 200;

  beforeEach(() => {
    myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);
  });

  // larger data, returned arrays ordered by highest score/shortest path => same order?
  test('dataPathLength and dataAnomalyScore methods, compare ordered arrays on larger data', () => {
    const pathLengths = myForest.dataPathLength();
    const anomalyScores = myForest.dataAnomalyScore();
    const combinedArray = _.zipWith(pathLengths, anomalyScores, (value1, value2) => [value1, value2]);

    const sortedByPath = _.cloneDeep(combinedArray);
    const sortedByScore = _.cloneDeep(combinedArray);
    sortedByPath.sort((a, b) => a[0] - b[0]); // sort based on pathLengths ascending
    sortedByScore.sort((a, b) => b[1] - a[1]); // sort base on anomalyScores descending

    expect(pathLengths).toHaveLength(testingData.length);
    expect(_.isEqual(sortedByPath, sortedByScore)).toBe(true);
  });

  test('average path length of anomaly should be short and shorter than of other data members', () => {
    const pathLengths = myForest.dataPathLength();

    expect(pathLengths[0]).toBeLessThan(3.5);
    expect(pathLengths[10]).toBeGreaterThan(7);
    expect(pathLengths[100]).toBeGreaterThan(7);
    expect(pathLengths[200]).toBeGreaterThan(7);
    expect(_.indexOf(pathLengths, _.min(pathLengths))).toBe(0); // is minimum path length on index 0?
  });

  test('anomaly score of anomaly should be high and higher than of other data members', () => {
    const anomalyScores = myForest.dataAnomalyScore();

    expect(anomalyScores[0]).toBeGreaterThan(0.8);
    expect(anomalyScores[10]).toBeLessThan(0.6);
    expect(anomalyScores[100]).toBeLessThan(0.6);
    expect(anomalyScores[200]).toBeLessThan(0.6);
    expect(_.indexOf(anomalyScores, _.max(anomalyScores))).toBe(0); // is maximum anomaly score on index 0?
  });
});

describe('Isolation Forest - testing methods calling each other', () => {
  let myForest;

  const testingData = [
    [4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
    [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
    [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
    [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]
  ];

  const testingNumberOfTrees = 3;
  const testingSampleSize = 6;

  beforeEach(() => {
    myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);
  });

  // calling the methods by constructor
  test('methods get called during IsolationForest initialisation', () => {
    // Spy on the methods
    const buildForestSpy = jest.spyOn(IsolationForest.prototype, 'buildForest');
    const sampleSpy = jest.spyOn(IsolationForest.prototype, 'sample');
    const buildTreeSpy = jest.spyOn(IsolationForest.prototype, 'buildTree');
    const printForestInfoSpy = jest.spyOn(IsolationForest.prototype, 'printForestInfo');
    const consoleSpy = jest.spyOn(console, 'log');

    myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);

    expect(buildForestSpy).toHaveBeenCalledTimes(1);
    expect(sampleSpy).toHaveBeenCalledTimes(testingNumberOfTrees);
    expect(sampleSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(Number));
    expect(buildTreeSpy).toHaveBeenCalled();
    expect(buildTreeSpy).toHaveBeenCalledWith(expect.any(Array));
    expect(printForestInfoSpy).toHaveBeenCalledTimes(1);
    expect(consoleSpy).toHaveBeenCalledWith('\n===============================================');
    expect(consoleSpy).toHaveBeenCalledWith('   data size: 16, number of attributes: 2');
    expect(consoleSpy).toHaveBeenCalledWith('-----------------------------------------------');
    expect(consoleSpy).toHaveBeenCalledWith('   number of trees: 3, sample size: 6');
    expect(consoleSpy).toHaveBeenCalledWith('-----------------------------------------------');
    expect(consoleSpy).toHaveBeenCalledWith('   height limit of trees set to: 3');
    expect(consoleSpy).toHaveBeenCalledWith('-----------------------------------------------');
    expect(consoleSpy).toHaveBeenCalledWith('   >>>    ISOLATION FOREST CREATED    <<<');
    expect(consoleSpy).toHaveBeenCalledWith('===============================================\n');
  });

  test('methods get called when exportForest method is called', () => {
    const exportTreeSpy = jest.spyOn(myForest, 'exportTree');
    const buildGraphSpy = jest.spyOn(myForest, 'buildGraph');

    myForest.exportForest('test', 'png');

    expect(exportTreeSpy).toHaveBeenCalledTimes(testingNumberOfTrees);
    expect(exportTreeSpy).toHaveBeenCalledWith(
      expect.any(InternalNode),
      expect.any(String),
      expect.any(String),
      expect.any(Boolean)
    );
    expect(buildGraphSpy).toHaveBeenCalledTimes(testingNumberOfTrees);
    expect(buildGraphSpy).toHaveBeenCalledWith(expect.anything(), expect.any(InternalNode));
  });

  test('methods get called when dataPathLength method is called', () => {
    const pathLengthSpy = jest.spyOn(myForest, 'pathLength');
    const calculateCSpy = jest.spyOn(myForest, 'calculateC');

    myForest.dataPathLength();

    expect(pathLengthSpy).toHaveBeenCalled();
    expect(pathLengthSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(InternalNode || ExternalNode));
    expect(calculateCSpy).toHaveBeenCalled();
    expect(calculateCSpy).toHaveBeenCalledWith(expect.any(Number));
  });

  test('methods get called when dataAnomalyScore method is called', () => {
    const pathLengthSpy = jest.spyOn(myForest, 'pathLength');
    const calculateCSpy = jest.spyOn(myForest, 'calculateC');
    const maxAnomalyScoresSpy = jest.spyOn(myForest, 'maxAnomalyScores');

    myForest.dataAnomalyScore();

    expect(pathLengthSpy).toHaveBeenCalled();
    expect(pathLengthSpy).toHaveBeenCalledWith(expect.any(Array), expect.any(InternalNode || ExternalNode));
    expect(calculateCSpy).toHaveBeenCalled();
    expect(calculateCSpy).toHaveBeenCalledWith(expect.any(Number));
    expect(maxAnomalyScoresSpy).toHaveBeenCalledTimes(0);

    myForest.dataAnomalyScore(3); // called with optional argument to call maxAnomalyScores method
    expect(maxAnomalyScoresSpy).toHaveBeenCalledTimes(1);
    expect(maxAnomalyScoresSpy).toHaveBeenCalledWith(
      expect.any(Array),
      expect.any(Array),
      expect.any(Number)
    );
  });
});

describe('Isolation Forest - testing pathLength method', () => {
  // creating test tree, fully isolated tree from 16 size data, 15 internal and 16 external nodes

  // external nodes
  const ext1 = new ExternalNode(1, 2);
  const ext2 = new ExternalNode(1, 3);
  const ext3 = new ExternalNode(1, 4);
  const ext4 = new ExternalNode(1, 4);
  const ext5 = new ExternalNode(1, 4);
  const ext6 = new ExternalNode(1, 4);
  const ext7 = new ExternalNode(1, 4);
  const ext8 = new ExternalNode(1, 4);
  const ext9 = new ExternalNode(1, 4);
  const ext10 = new ExternalNode(1, 5);
  const ext11 = new ExternalNode(1, 5);
  const ext12 = new ExternalNode(1, 5);
  const ext13 = new ExternalNode(1, 5);
  const ext14 = new ExternalNode(1, 5);
  const ext15 = new ExternalNode(1, 6);
  const ext16 = new ExternalNode(1, 6);

  // internal nodes - connected to their child nodes
  const int15 = new InternalNode(ext15, ext16, 0, 2.5, 2);
  const int14 = new InternalNode(ext13, ext14, 1, 2.6, 2);
  const int13 = new InternalNode(int15, ext12, 1, 2.1, 3);
  const int12 = new InternalNode(ext10, ext11, 1, 2.2, 2);
  const int11 = new InternalNode(ext9, int14, 0, 2.2, 3);
  const int9 = new InternalNode(ext7, ext8, 0, 2.3, 2);
  const int10 = new InternalNode(int12, int13, 0, 2, 5);
  const int8 = new InternalNode(ext5, ext6, 0, 1.5, 2);
  const int7 = new InternalNode(ext3, ext4, 0, 1.6, 2);
  const int6 = new InternalNode(int10, int11, 1, 2.3, 8);
  const int5 = new InternalNode(ext2, int9, 1, 1.4, 3);
  const int4 = new InternalNode(int7, int8, 1, 1.6, 4);
  const int3 = new InternalNode(int6, ext1, 0, 3, 9);
  const int2 = new InternalNode(int4, int5, 0, 1.8, 7);

  // root node of the testing tree
  const testingTree = new InternalNode(int2, int3, 1, 1.8, 16);

  let myForest;

  const testingData = [
    [4.5, 2.25], [1.75, 1.5], [1.75, 2], [1.75, 1.75],
    [2.25, 2], [2.25, 2.25], [1.75, 2.5], [1.5, 2.25],
    [1.25, 1.75], [1.5, 1.5], [2, 1.25], [2.25, 1.5],
    [2.5, 1.75], [2.75, 2], [2.5, 2.5], [2.25, 2.75]
  ];

  const testingNumberOfTrees = 1;
  const testingSampleSize = 16;

  myForest = new IsolationForest(testingData, testingNumberOfTrees, testingSampleSize);

  // visually compare the exported tree to expected output
  myForest.exportTree(testingTree, 'png', 'img/testingTreeExport');

  // testing pathLength method to return correct values,
  // using testingTree (hand made tree) to be able to predict the results
  test('pathLength method returning correct values', () => {
    expect(myForest.pathLength([4.5, 2.25], testingTree)).toBe(2);
    expect(myForest.pathLength([1.75, 1.75], testingTree)).toBe(4);
    expect(myForest.pathLength([2.75, 2], testingTree)).toBe(6);
    expect(myForest.pathLength([2.1, 2.0], testingTree)).toBe(6);
    expect(myForest.pathLength([0, 0], testingTree)).toBe(4);
    expect(myForest.pathLength([100, 100], testingTree)).toBe(2);
    expect(myForest.pathLength([0, 100], testingTree)).toBe(4);
    expect(myForest.pathLength([-1, -1], testingTree)).toBe(4);
  });
});
