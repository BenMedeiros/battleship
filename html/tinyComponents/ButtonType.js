'use strict';

export class ButtonType {
  element = null;
  parentsElements = [];
  textElement = null;

  constructor(name, text, onclick, disabled, iconMdiText, parentEl) {
    this.name = name;
    this.text = text;
    this.disabled = disabled;
    this.onclick = onclick;
    this.iconMdiText = iconMdiText
    if (parentEl) this.createElementIn(parentEl);
  }

  destroy() {
    if (this.element) this.element.remove();
  }

  createElementIn(parentEl) {
    if (this.parentsElements.indexOf(parentEl) !== -1) {
      console.error('Already exists in this element', this);
    }

    const btnEl = document.createElement("button");
    btnEl.id = this.name;
    btnEl.name = this.name;
    if (this.disabled) btnEl.disabled = this.disabled;

    if (this.onclick) {
      if (typeof this.onclick === 'string') {
        btnEl.onclick = () => document.dispatchEvent(new Event(this.onclick));
      } else if (typeof this.onclick === 'function') {
        btnEl.onclick = this.onclick;
      } else {
        throw new Error('Unknown onclick type.');
      }
    }

    if (this.iconMdiText) {
      const i = document.createElement("i");
      // i.classList.add('material-icons');
      i.innerText = 'undo';
      btnEl.appendChild(i);
    }

    if (this.text) {
      this.textElement = document.createElement("span");
      this.textElement.innerText = this.text;
      btnEl.appendChild(this.textElement);
    }

    parentEl.appendChild(btnEl);
    this.element = btnEl;
    this.parentsElements.push(parentEl);
    return btnEl;
  }

  // true - disable, false - enable
  disableIf(bool) {
    if (bool) {
      this.disable();
    } else {
      this.enable();
    }
  }

  disable() {
    if (!this.disabled) {
      this.disabled = true;
      if (this.element) this.element.disabled = true;
    }
  }

  enable() {
    if (this.disabled) {
      this.disabled = false;
      if (this.element) this.element.disabled = false;
    }
  }

  setValue(value) {
    if (this.text === value) return;
    this.text = value;
    this.textElement.innerText = value;
  }
}
