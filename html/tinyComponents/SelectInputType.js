'use strict';

let idCounter = 0;

/*
* Select input drop down, can take in new values map and only add/removes diffs
* */

// valuesMap is key: value of key sent when selected vs display value
export class SelectInputType {
  element = null;
  // currently using the placeholder or not (aka valuesMap is empty)
  usingPlaceholder = false;

  constructor(name, labelText, initialValue, valuesMap, placeholderMap, readOnly) {
    if (name === 'id') {
      throw new Error('id/name cannot be id because it messes up using el.id for some reason');
    }

    this.id = name + '-slt-' + idCounter++;
    this.name = name;
    this.labelText = labelText;
    this.initialValue = initialValue;
    if (valuesMap && typeof valuesMap !== 'object') {
      throw new Error('valuesMap must be key:displayValue object');
    }
    this.valuesMap = valuesMap || {};
    if (placeholderMap && (typeof placeholderMap !== 'object' || Object.keys(placeholderMap).length < 1)) {
      throw new Error('placeholderMap must be NULL or object with at least 1 key.');
    }
    // placeholderMap shown if the valuesMap is updated to empty
    this.placeholderMap = placeholderMap;
    this.readOnly = readOnly;
  }


  createElementIn(parentEl) {
    this.element = document.createElement('select');
    this.element.id = this.id;
    this.element.name = this.name;

    for (const [key, displayValue] of Object.entries(this.valuesMap)) {
      createOptionElement(this.element, key, displayValue, this.initialValue === key);
    }

    if (!this.labelText) {
      parentEl.appendChild(this.element);
    } else {
      if (this.labelText) {
        const divEl = document.createElement("div");

        const labelEl = document.createElement("label");
        labelEl.htmlFor = this.id;
        labelEl.innerText = this.labelText;

        divEl.appendChild(labelEl);
        divEl.appendChild(this.element);
        parentEl.appendChild(divEl);
      }
    }
  }

  setValuesMap(valuesMap) {
    if (!valuesMap) valuesMap = {};
    // deleting these first to ensure they are gone
    if (this.usingPlaceholder && Object.keys(valuesMap).length > 0) {
      deletePlaceholderOptions(this);
    }

    // find what in the old map needs to be deleted
    for (const [oldKey, oldDisplayValue] of Object.entries(this.valuesMap)) {
      if (valuesMap[oldKey] === undefined) {
        const elToDelete = document.getElementById(this.id + '-' + oldKey);
        elToDelete.remove();
      }
    }
    // add the new keys that are needed, and update displayValues that have changed
    for (const [newKey, newDisplayValue] of Object.entries(valuesMap)) {
      if (this.valuesMap[newKey] === undefined) {
        createOptionElement(this.element, newKey, newDisplayValue, this.initialValue === newKey);
      } else if (this.valuesMap[newKey] !== newDisplayValue) {
        const elToUpdate = document.getElementById(this.id + '-' + newKey);
        elToUpdate.innerText = newDisplayValue;
      }
    }

    this.valuesMap = valuesMap;

    // create placeholders here so they aren't deleted by code above
    if (this.placeholderMap && Object.keys(valuesMap).length === 0) {
      if (this.usingPlaceholder) {
        //  already usingPlaceholder so all set
      } else {
        populatePlaceholderOptions(this);
      }
    }
  }

  // returns the key for the valuesMap selected
  getValue() {
    return this.element.value;
  }

  // selects the value from valuesMap, will not do anything if key doesn't exist
  selectValue(key) {
    const optionEl = document.getElementById(this.id + '-' + key);
    if (!optionEl) {
      console.log('optionEl for key doesnt exist', key);
      return;
    }

    optionEl.selected = true;
  }

}

function createOptionElement(selectEl, key, displayValue, isSelected) {
  const optionEl = document.createElement('option');
  optionEl.id = selectEl.id + '-' + key;
  optionEl.value = key;
  optionEl.innerText = displayValue;
  if (isSelected) optionEl.selected = true;
  selectEl.appendChild(optionEl);
}

// validations on placeholder struct already handled in constructor
function populatePlaceholderOptions(selectInputType) {
  if (!selectInputType.placeholderMap) return;
  if (Object.keys(selectInputType.valuesMap).length > 0) return;

  selectInputType.usingPlaceholder = true;

  for (const [key, value] of Object.entries(selectInputType.placeholderMap)) {
    createOptionElement(selectInputType.element, key, value);
  }
}

function deletePlaceholderOptions(selectInputType) {
// validations done before calling this function
  selectInputType.usingPlaceholder = false;

  for (const [key, oldDisplayValue] of Object.entries(selectInputType.placeholderMap)) {
    const elToDelete = document.getElementById(selectInputType.id + '-' + key);
    elToDelete.remove();
  }
}
