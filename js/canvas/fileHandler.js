'use strict';

// <input type="file" id="img" name="img" accept="image/*" multiple>
export function createFileUploadBtn() {
  const btnWrapper = document.createElement('button');

  const el = document.createElement('input');
  el.id = 'imgUpload';
  el.type = 'file';
  el.accept = 'image/*';
  el.multiple = true;
  btnWrapper.appendChild(el);
  document.getElementById("navigation-bar").appendChild(btnWrapper);

  el.onload = (e) => {
    console.log('img loaded', e);
  };

  el.addEventListener('input', (e) => {
    for (const file of e.target.files) {
      loadLocalFileImage(file);
    }
  });
}

function loadLocalFileImage(file, cb) {
  const fr = new FileReader();

  fr.onload = () => {
    const img = new Image();
    img.onload = cb;
    img.src = fr.result;
  };

  fr.readAsDataURL(file);
}

const serverImageCache = {};
// loads the server image async if not loaded, otherwise return sync
// loadServerImage('/img/004.png');
export function loadServerImage(src, cb) {
  if (serverImageCache[src]) return serverImageCache[src];

  console.log('loading from server');
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  // onload passes just event, so you have to send img
  img.onload = () => {
    serverImageCache[src] = img;
    if (cb) cb(img);
  };

  img.onerror = () => {
    // load the server image with /battleship because GitHub Pages prefix this sometimes
    if (img.src.startsWith('/battleship')) {
      console.error('couldnt load resource even with /battleship prefix');
    } else {
      img.src = '/battleship' + src;
      img.onload = () => {
        serverImageCache[src] = img;
        if (cb) cb(img);
      };
    } 
  }
}

function loadServerImageWithPrefix(src, cb) {

}

