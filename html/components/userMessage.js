'use strict';

/*
* Handler for displaying messages to user based on errors, validations, and current
* turn info.
* */

const msgEl = document.getElementById("msg");
const errorMsgEl = document.getElementById("error-msg");

let msgCounter = 0;

export default {
  msg: (msg) => {
    msgEl.innerText = `[${msgCounter++}] ${msg}, ${msgEl.innerText}`;
    setTimeout(trimMsg, 6000);
  },
  errorMsg: (msg) => {
    errorMsgEl.innerText = msg;
    errorMsgEl.style.display = null;
    // remove error msg after 3 seconds
    if (errorMsgTimeout) clearTimeout(errorMsgTimeout);
    errorMsgTimeout = setTimeout(clearErrorMsg, 3000);
  }
}

let errorMsgTimeout = null

function clearErrorMsg() {
  // errorMsgEl.innerText = '';
  // display none is better otherwise certain css styles affect it
  errorMsgEl.style.display = 'none';
}

function trimMsg() {
  const lastComma = msgEl.innerText.lastIndexOf(', ');
  if (lastComma > 50) {
    msgEl.innerText = msgEl.innerText.substring(0, lastComma);
  }
}

