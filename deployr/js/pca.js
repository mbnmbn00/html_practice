// Run PCA

function runPCA(data, shape) {
  let promise = d3.tsv(dataUrl, d => d);
  promise.then(function (dat) {
    let matrix = dat.map(function(d) {
      return Object.values(d).slice(1, d.length).map(parseFloat);
    });
    let vectors = PCA.getEigenVectors(matrix);
    let adData1 = PCA.computeAdjustedData(matrix, vectors[0]).adjustedData;
    let adData2 = PCA.computeAdjustedData(matrix, vectors[1]).adjustedData;
    let newPoints = data.map(function(d, index) {
      return {
        portalId : d.portal_id,
        PC1 : adData1[0][index],
        PC2 : adData2[0][index],
      }
    });
    let PC1Explained = PCA.computePercentageExplained(vectors,vectors[0]);
    let PC2Explained = PCA.computePercentageExplained(vectors,vectors[1]);
    PC1Explained = Math.round((PC1Explained + Number.EPSILON) * 10000) / 100
    PC2Explained = Math.round((PC2Explained + Number.EPSILON) * 10000) / 100
    updatePoints(data, shape, newPoints, PC1Explained, PC2Explained);
  })
};
