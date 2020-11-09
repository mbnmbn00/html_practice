/* Example PCA calculation code
let data = [[40,50,60],[50,70,60],[80,70,90],[50,60,80]];
let vectors = PCA.getEigenVectors(data);
let adData1 = PCA.computeAdjustedData(data,vectors[0]);
let adData2 = PCA.computeAdjustedData(data,vectors[1]);
*/

function loadData(file_path) {
  let promise = d3.tsv(file_path, function(d) {
    return d;
  });
  return promise
};

function calculatePCA(data) {
  let matrix = data.map(function(d) {
    return Object.values(d).slice(4, d.length).map(parseFloat);
  });
  let vectors = PCA.getEigenVectors(matrix);
  let adData1 = PCA.computeAdjustedData(matrix, vectors[0]).adjustedData;
  let adData2 = PCA.computeAdjustedData(matrix, vectors[1]).adjustedData;
  document.getElementById("content").innerHTML = "<pre style='white-space: pre-line'>PC1: " + adData1 + "<br>" + "PC2: " + adData2 + "</pre>";

  d3.select("#button1").on("click", function() {
    loadData("src/wood_rot_fungi_cazy.tsv").then(calculatePCA);
  });
  d3.select("#button2").on("click", function() {
    loadData("src/Lentinula_cazy.tsv").then(calculatePCA);
  });
  d3.select("#button3").on("click", function() {
    loadData("src/Tripara1_cazy.tsv").then(calculatePCA);
  });

};

loadData("src/wood_rot_fungi_cazy.tsv").then(calculatePCA);
