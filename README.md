# isolation-forest-visualization

## Overview

**`isolation-forest-visualization`** is a tool for anomaly detection based on the Isolation Forest algorithms. It provides functionality for creating isolation forest, evaluating anomalies, and **visualizing** the trees in the forest.

## Installation

Before using the library, make sure you have installed [Node.js](https://nodejs.org/en/download) and [Graphviz](https://graphviz.org/download/)
properly based on your operating system.

## Usage

### Creating an Instance of IsolationForest Class

To create an instance of the `IsolationForest` class, follow these steps:

1. Import the required module:

```javascript
const { IsolationForest } = require('isolation-forest-visualization');
```

2. Instantiate the `IsolationForest` class with the desired parameters:

```javascript
const data = [[7, 3], [2, 5], [3, 4] ...]; // Your data
const numberOfTrees = 100; // Number of trees in the forest
const sampleSize = 256; // Size of the sample of data

const myForest = new IsolationForest(data, numberOfTrees, sampleSize);
```
**note:** the data should be array of arrays, all data members (inner arrays) must be of the same length and must be unique. 

### Methods

### `dataPathLength()`

Calculate the average path length for each data member over all isolation trees.

```javascript
const averagePathLengths = myForest.dataPathLength();
```

### `dataAnomalyScore()`

Calculate the anomaly score for each data member.

```javascript
const anomalyScores = myForest.dataAnomalyScore(numberOfAnomalies);
```
### `dataAnomalyScore(numberOfAnomalies) - using optional parameter`

Calculate the anomaly score for each data member. If `numberOfAnomalies` is provided, it also prints information about the top anomalies.

```javascript
const numberOfAnomalies = 5; // Number of anomalies to display
const anomalyScores = myForest.dataAnomalyScore(numberOfAnomalies);
```

### `exportTree(treeToExport, exportFormat, fileName, exportInfo)`

Export a single tree from the forest as an image file. In the `IsolationForest` class trees are stored in an array called `forest`, and can be accessed based on their index.

```javascript
const treeToExport = myForest.forest[0];   // tree to export
const exportFormat = 'png'; // Output format (e.g., png, svg, pdf)
const fileName = 'tree'; // Output file name (without extension)
isolationForest.exportTree(treeToExport, exportFormat, fileName);
```
**note:** export format and file name are strings, file name can be given including a name of an existing folder (`"img/tree"`). Export format can be a supported format of the Graphviz software (e.g. `png, pdf, dot, jpg, svg`).

### `exportForest(forestExportFormat, fileName)`

Export the entire forest as image files, one for each tree. The rules for export format and file name are the same as for `exportTree` method. The name of the exported file will include the index of the tree from the `forest` array (e.g. `"forestExport1.png"`).

```javascript
const forestExportFormat = 'png'; // Output format (e.g., png, svg, pdf)
const fileName = 'forestExport'; // Output file name (without extension, index will be appended)
myForest.exportForest(forestExportFormat, fileName);
```

### Example

An example of how to use the `isolation-forest-visualization` library:

```javascript
const { IsolationForest } = require('isolation-forest-visualization');

// Sample data
const data = [[1, 2], [3, 4], [5, 6], [7, 8]];

// create an Isolation Forest instance with 5 trees and sample 2
const myForest = new IsolationForest(data, 5, 2);

// calculate average path lengths all data
const pathLengths = isolationForest.dataPathLength;

// calculate anomaly scores for all data, show 2 top anomalies in the console
const anomalyScores = isolationForest.dataAnomalyScore(2);

// export the tree on index 0
myForest.exportTree(myForest.forest[0], 'png', 'forest/tree');

// export the forest
myForest.exportForest('png', 'forest/tree');
```

This example creates an Isolation Forest with sample data, calculates average path lengths and anomaly scores for all data, displays top 2 anomalies in the console, exports the tree on index 0 and then the entire forest as image files.

