const exec = require('child_process').exec;
const fs = require('fs');
const path = require('path');

// find the styles css file
const files = getFilesFromPath('./dist/animet/', '.css');
let data = [];

if (!files && files.length <= 0) {
  console.log("cannot find style files to purge");
  return;
}

for (let f of files) {
  // get original file size
  const originalSize = getFilesizeInKiloBytes('./dist/animet/' + f) + "kb";
  var o = { "file": f, "originalSize": originalSize, "newSize": "" };
  data.push(o);
}

console.log("Run PurgeCSS...");

exec("purgecss -css dist/*.css --content dist/index.html dist/*.js -o dist/", function (error, stdout, stderr) {
  console.log("PurgeCSS done");
  console.log();

  for (let d of data) {
    // get new file size
    const newSize = getFilesizeInKiloBytes('./dist/animet/' + d.file) + "kb";
    d.newSize = newSize;
  }

  console.table(data);
});

console.log("Run uglify-js...");
exec("uglifyjs dist/animet/ngsw-worker.js -o ngsw-worker.js", function (error, stdout, stderr) {
  console.log("uglify-js done");
  console.log();
});

// minify jsons 
let ngswJson = fs.readFileSync('dist/animet/ngsw.json', 'utf-8');
let ngswJsonMinified = JSON.stringify(JSON.parse(ngswJson));
fs.writeFileSync('dist/animet/ngsw.json', ngswJsonMinified, 'utf-8');

function getFilesizeInKiloBytes(filename) {
  var stats = fs.statSync(filename);
  var fileSizeInBytes = stats.size / 1024;
  return fileSizeInBytes.toFixed(2);
}

function getFilesFromPath(dir, extension) {
  let files = fs.readdirSync(dir);
  return files.filter(e => path.extname(e).toLowerCase() === extension);
}