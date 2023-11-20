'use strict';

/*
* Handler for displaying messages to user based on errors, validations, and current
* turn info.
* */

// const msgEl = document.getElementById("msg");
// const errorMsgEl = document.getElementById("error-msg");
//
// let msgCounter = 0;
//
// export default {
//   msg: (msg) => {
//     msgEl.innerText = `[${msgCounter++}] ${msg}, ${msgEl.innerText}`;
//     setTimeout(trimMsg, 6000);
//   },
//   errorMsg: (msg) => {
//     errorMsgEl.innerText = msg;
//     errorMsgEl.style.display = null;
//     // remove error msg after 3 seconds
//     if (errorMsgTimeout) clearTimeout(errorMsgTimeout);
//     errorMsgTimeout = setTimeout(clearErrorMsg, 3000);
//   }
// }
//
// let errorMsgTimeout = null
//
// function clearErrorMsg() {
//   // errorMsgEl.innerText = '';
//   // display none is better otherwise certain css styles affect it
//   errorMsgEl.style.display = 'none';
// }
//
// function trimMsg() {
//   const lastComma = msgEl.innerText.lastIndexOf(', ');
//   if (lastComma > 50) {
//     msgEl.innerText = msgEl.innerText.substring(0, lastComma);
//   }
// }

// build a header bar in the element for displaying user messages
export class UserMessage {
  constructor() {
    this.currentMessagesIndex = 0;
    this.messageHistory = [];
    this.errorMsgTimeout = null;
  }

  createElementIn(parentElement, width) {
    this.msgEl = document.createElement('div');
    this.msgEl.classList.add('msg');
    this.msgEl.style.width = width + 'px';
    this.errorMsgEl = document.createElement('div');
    this.errorMsgEl.classList.add('error-msg');
    this.errorMsgEl.style.width = width + 'px';
    this.errorMsgEl.style.display = null;

    parentElement.appendChild(this.msgEl);
    parentElement.appendChild(this.errorMsgEl);
  }

  destroy() {
    this.msgEl.remove();
    this.errorMsgEl.remove();
    delete this.msgEl;
    delete this.errorMsgEl;
  }

  message(msg) {
    const msg_id = this.messageHistory.push(msg) - 1;
    this.rewriteMessages();
  }

  error(msg) {
    this.errorMsgEl.innerText = msg;
    this.errorMsgEl.style.display = null;

    if (this.errorMsgTimeout) clearTimeout(this.errorMsgTimeout);
    this.errorMsgTimeout = setTimeout(() => {
      this.errorMsgEl.style.display = 'none';
      this.errorMsgEl.innerText = '';
    }, 3000);
  }

  rewriteMessages() {
    let str = '';
    let i = this.messageHistory.length - 1;
    while (true) {
      str += ` [${i}] ` + this.messageHistory[i];
      i--;
      if (i >= this.currentMessagesIndex) {
        str += ',';
      } else {
        break;
      }
    }

    if (this.currentMessagesIndex > 0) str += '...';
    this.msgEl.innerText = str;
  }

  trimMessage() {
    if (this.currentMessagesIndex < this.messageHistory.length) {
      this.currentMessagesIndex++;
      this.rewriteMessages();
    }
  }


}
