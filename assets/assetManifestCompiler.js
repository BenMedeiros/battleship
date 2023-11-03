const fs = require('fs');
const path = require('path');

// creates manifest for all assets in the folder
function createManifestForFolder(folder) {
  const fullPathToFolder = fullPath + folder + '/';

  const files = fs.readdirSync(fullPathToFolder);
  const exportMap = {};

  files.forEach((fileName) => {
    const ext = path.extname(fileName);
    const fileNoExt = fileName.substring(0, fileName.length - ext.length);
    const fileInfo = fs.statSync(fullPathToFolder + fileName);

    if (exportMap[fileNoExt]) {
      throw new Error('Duplicate file ignoring extension ' + fileNoExt);
    }

    exportMap[fileNoExt] = {
      fileName: fileName,
      src: folderPath + fileName,
      size: fileInfo.size
    };
  });

  const content = 'export default ' + JSON.stringify(exportMap, null, 2);

  fs.writeFile(fullPathToFolder + folder + '_manifest.js', content, err => {
    if (err) {
      console.error(err);
    }
  });
}


const rootPath = 'D:/Game Development/battleship';
const folderPath = '/assets/';
const fullPath = rootPath + folderPath
createManifestForFolder('img');
createManifestForFolder('audio');

