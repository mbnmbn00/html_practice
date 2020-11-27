// Inpuf files
const treeUrl = 'src/single_copy_orthologs_aligned.tree';
const dataUrl = 'src/3981_cazy_subclass.tsv';
const infoUrl = 'src/3981_info.tsv';
//const dataUrl = 'src/out_cazy_subclass.tsv';
//const infoUrl = 'src/all_fungi_info.tsv';

// loader settings
var opts = {
  lines: 9, // The number of lines to draw
  length: 9, // The length of each line
  width: 5, // The line thickness
  radius: 14, // The radius of the inner circle
  color: '#EE3124', // #rgb or #rrggbb or array of colors
  speed: 1.9, // Rounds per second
  trail: 40, // Afterglow percentage
  className: 'spinner', // The CSS class to assign to the spinner
};

var target;
var spinner = new Spinner(opts);
$(document).ready(function() {
  target = document.getElementById('pca');
  spinner.spin(target);
});

// Calculate PC1 and PC2
runPhylPCA(treeUrl, dataUrl);