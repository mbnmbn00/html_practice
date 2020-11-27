//set page to communicate to with "mypackage" on server below
function runPhylPCA(treeUrl, dataUrl) {
  ocpu.seturl("http://localhost:5656/ocpu/library/runPhylPCA/R")
  $.when(
    $.get(treeUrl),
    $.get(dataUrl)
  ).then(function(data1, data2) {
    let treeStr = data1[0];
    let dataStr = data2[0];
    var req = ocpu.rpc("runPhylPCA", {
      tree_str: treeStr,
      data_str: dataStr,
    }, function(output) {
      let pcData = output.map(function(d) {
        return {
          portal_id : d[0],
          PC1 : +d[1],
          PC2 : +d[2]
        }
      });
      loadData(pcData).then(showData);
    });
    req.fail(function(){
      alert("R returned an error: " + req.responseText);
    });
  });
}

function updatePhylPCA() {
  ocpu.seturl("http://localhost:5656/ocpu/library/runPhylPCA/R")
  $.when(
    $.get(treeUrl),
    $.get(dataUrl)
  ).then(function(data1, data2) {
    let treeStr = data1[0];
    let dataStr = data2[0];
    var req = ocpu.rpc("runPhylPCA", {
      tree_str: treeStr,
      data_str: dataStr,
    }, function(output) {
      let newPoints = output.map(function(d) {
        return {
          portalId : d[0],
          PC1 : +d[1],
          PC2 : +d[2]
        }
      });
      updatePoints(newPoints);
    });
    req.fail(function(){
      alert("R returned an error: " + req.responseText);
    });
  });
}