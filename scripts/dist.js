const glob = require('glob-fs')();
const fs = require('fs');

// Generate consistently named static assets, so that other repos can link to them
glob.readdirPromise('./build/static/**/*')
.then((files) => {
  files.forEach((file) => {
    const ext = file.split('.').pop();
    if (ext === 'js' || ext === 'css') {
      // Replace the build hash with ".latest"
      const newName = file.replace(/(\.[a-zA-Z0-9]+)(\.(css|js))/, "$2")
      fs.createReadStream(file)
      .pipe(fs.createWriteStream(newName));
    }
  });
});
