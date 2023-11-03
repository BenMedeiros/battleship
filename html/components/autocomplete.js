'use strict';

export function bindAutocomplete(inputType, onclickCb) {
//  document.activeElement
  inputType.element.addEventListener('input', (e) => {
    console.log(e.target.value);
    rebuildAutoComplete(inputType, onclickCb);
  });
}

function rebuildAutoComplete(inputType, onclickCb) {
  // save who's autocomplete this is
  if (inputType !== requesterInputType) requesterInputType = inputType;

  if (!autocompleteEl) {
    autocompleteEl = document.createElement('ul');
    autocompleteEl.id = 'autocomplete';
    document.getElementById('main').appendChild(autocompleteEl);
  }
  clearAutocomplete();
  autocompleteEl.style.left = inputType.element.getBoundingClientRect().left + 'px';
  autocompleteEl.style.top = inputType.element.getBoundingClientRect().bottom + 'px';

  let currentValue = inputType.getValue();
  if (currentValue) currentValue = currentValue.toUpperCase().trim();

  for (const value of Object.values(inputType.autocomplete)) {
    const li = document.createElement('li');
    //highlight autocomplete option with matches
    const matchIndex = value.toUpperCase().indexOf(currentValue);

    if (matchIndex === -1) {
      li.innerText = String(value);
    } else {
      li.classList.add('matched');
      //break word into before match, match, and after match
      const span0 = document.createElement('span');
      span0.innerText = value.substr(0, matchIndex);
      li.appendChild(span0);
      const span1 = document.createElement('strong');
      span1.innerText = value.substr(matchIndex, currentValue.length);
      li.appendChild(span1);
      const span2 = document.createElement('span');
      span2.innerText = value.substr(matchIndex + currentValue.length);
      li.appendChild(span2);
    }

    li.onclick = () => autocompleteClicked(value, onclickCb);
    autocompleteEl.appendChild(li);
  }
  //unhide the autocomplete now that its built
  autocompleteEl.style.visibility = 'initial';
  listenForClose();
}

function autocompleteClicked(value, onclickCb) {
  console.log('clicked', value);
  onclickCb(value);
  closeAutocomplete();
}

// check if the autocomplete should be closed based on key/click event
function closeAutocomplete(event) {
  //remove and close the autocomplete
  if (autocompleteEl && autocompleteEl.style.visibility !== 'hidden') {
    if (event && (event.code === 'Tab' || event.code === 'Escape')) {
      //  if key down tab/escape, close even if in focus
      // initially blank
    } else if (document.activeElement === requesterInputType.element) {
      // clicking on same element shouldn't close it
      return;
    }
    autocompleteEl.style.visibility = 'hidden';
    clearAutocomplete();
    document.removeEventListener('click', closeAutocomplete);
    document.addEventListener('input', closeAutocomplete);
    listening = false;
  }
}

function clearAutocomplete() {
  while (autocompleteEl.firstChild) {
    autocompleteEl.removeChild(autocompleteEl.lastChild);
  }
}

function listenForClose() {
  // don't want to stack them
  if (!listening) {
    // document.activeElement reflects what was clicked on
    document.addEventListener('click', closeAutocomplete);
    // document.activeElement reflects before Tab is applied since it's keydown
    document.addEventListener('keydown', closeAutocomplete);
    listening = true;
  }
}


// only one autocomplete component needs to exist for entire page
let autocompleteEl = null;
let requesterInputType = null;
let listening = false;

