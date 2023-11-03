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

// loadServerImage('/img/004.png');
export function loadServerImage(src, cb) {
  const img = new Image();
  img.crossOrigin = "anonymous";
  img.src = src;
  // onload passes just event, so you have to send img
  img.onload = cb.bind(null, img);
}

