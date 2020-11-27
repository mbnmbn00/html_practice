// Run PCA

function runPCA() {
  let promise = d3.tsv(dataUrl, d => d);
  promise.then(function (data) {
    let matrix = data.map(function(d) {
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
    updatePoints(newPoints)
  })
};
