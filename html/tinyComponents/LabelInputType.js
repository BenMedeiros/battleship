'use strict';

import {formatDate} from "./dateUtils.js";
import {bindAutocomplete} from "../components/autocomplete.js";

const supportedTypes = ['number', 'integer', 'currency', 'string', 'checkbox', 'date'];
let idCounter = 0;


/*
* Basic label and input that handles types and works with autocomplete.
*  new LabelInputType('winner', 'string', 'Winner', null, 'me', true);
* */

export class LabelInputType {
  element = null;
  parentElement = null;
  isModified = false;
  onModifiedCallbacks = [];
  onUnModifiedCallbacks = [];

  constructor(name, type, labelText, initialValue, placeholder, readOnly, parentEl) {
    if (name === 'id') {
      throw new Error('id/name cannot be id because it messes up using el.id for some reason');
    }
    this.id = name + '-lbl-' + idCounter++;
    this.name = name;
    //wrapped the type for common scenarios
    if (type === 'number') {
      this.step = 'any';
      this.type = 'number';
    } else if (type === 'integer') {
      this.step = '1';
      this.type = 'number';
    } else if (type === 'currency') {
      this.step = '.01'
      this.type = 'number';
    } else {
      this.type = type;
    }

    this.labelText = labelText;
    this.initialValue = initialValue;
    this.placeholder = placeholder;
    this.readOnly = readOnly;

    if (supportedTypes.indexOf(type) === -1) {
      throw new Error('Only supported types are: ' + supportedTypes.join(', '));
    }

    if (parentEl) this.createElementIn(parentEl);
  }

  createElementIn(parentEl) {
    this.parentElement = parentEl;

    this.element = document.createElement("input");
    this.element.type = this.type;
    this.element.id = this.id;
    this.element.name = this.name;

    if (this.initialValue !== undefined) {
      this.setValue(this.initialValue);
    }

    if (this.step !== undefined) this.element.step = this.step;
    if (this.readOnly) this.element.readOnly = true;

    if (this.placeholder !== undefined) {
      this.element.placeholder = this.placeholder;
    }

    //if no label, just create the input (ex. tables)
    if (this.labelText) {
      const divEl = document.createElement("div");

      const labelEl = document.createElement("label");
      labelEl.htmlFor = this.id;
      labelEl.innerText = this.labelText;

      divEl.appendChild(labelEl);
      divEl.appendChild(this.element);
      parentEl.appendChild(divEl);
    } else {
      parentEl.appendChild(this.element);
    }

    this.element.classList.toggle('modified', false);
    // use input to account for increment wheels
    this.element.addEventListener('input', (e) => {
      console.log('input');
      this.checkModified();
    });

    if (this.autocomplete) this.bindAutocomplete(this.autocomplete);
    return this.element;
  }

  getValue() {
    if (this.type === 'number') {
      if (this.element.value === '') {
        return this.placeholder || null;
      }
      return Number(this.element.value);

    } else if (this.type === 'string') {
      if (this.element.value === '') return null;
      return String(this.element.value);

    } else if (this.type === 'checkbox') {
      return this.element.checked === true;

    } else if (this.type === 'date') {
      if (!this.element.value || this.element.value === '') return null;
      return new Date(this.element.value);

    } else {
      return this.element.value;
    }
  }

  isInitialValue() {
    if (this.type === 'checkbox') {
      if (this.initialValue === true) {
        return this.element.checked === true;
      } else {
        return this.element.checked !== true;
      }
    } else if (this.type === 'date') {
      if (!this.getValue() && !this.initialValue) return true;
      if (!this.getValue() || !this.initialValue) return false;
      return this.getValue().valueOf() === this.initialValue.valueOf();
    } else {
      return this.getValue() === this.initialValue;
    }
  }

  checkModified() {
    //isModified has changed
    if (this.isModified === this.isInitialValue()) {
      this.isModified = !this.isInitialValue();
      this.element.classList.toggle('modified', this.isModified);

      if (this.isModified) {
        console.log('on mod', this.getValue());
        this.onModifiedCallbacks.forEach(cb => cb());
      } else {
        this.onUnModifiedCallbacks.forEach(cb => cb());
      }
    }
  }

  //called once when modified
  onModified(cb) {
    this.onModifiedCallbacks.push(cb);
  }

  //called once when returned to no modified
  onUnModified(cb) {
    this.onUnModifiedCallbacks.push(cb)
  }

  destroy() {
    if (this.element) this.element.remove();
  }

  //used for monitoring text change status; using a function in case of logging
  updateInitialValueToCurrent() {
    this.initialValue = this.getValue();
    this.checkModified();
  }

  bindAutocomplete(values) {
    this.autocomplete = values;
    //if not created yet, do it when created
    if (!this.element || !this.autocomplete) return;
    bindAutocomplete(this, (value) => this.setValue(value));
  }

  setValue(value) {
    if (!this.element) {
      // element not created yet so just update initial
      this.initialValue = value;
      return;
    }
    if (this.type === 'checkbox') {
      this.element.checked = value;
    } else if (this.type === 'date') {
      this.element.value = formatDate(value);
      // console.log(value, this.element.value);
    } else {
      this.element.value = value;
    }
  }

  // true - readOnly, false - editable
  readOnlyIf(bool) {
    if (bool) {
      if (!this.readOnly) {
        this.readOnly = true;
        this.element.readOnly = true;
      }
    } else {
      if (this.readOnly) {
        this.readOnly = false;
        this.element.readOnly = false;
      }
    }
  }

  setPlaceholder(str) {
    this.placeholder = str;
    this.element.placeholder = this.placeholder;
  }
}
