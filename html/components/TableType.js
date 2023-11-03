'use strict';

/*
* Creates a table that tracks user input changes. automatically adds rows when needed
*
* from receipt-scanner:
* * this.tableInput = new TableType('Lines', ['item', 'price', 'discount', 'quantity'],
      (line) => {
        this.addItemLine(line);
      }, getReceipt(this.id).lines);
*
*      this.tableInput.addRowValues(Object.values(newLine));
*
* */

export class TableType {
  rows = [];

  constructor(name, cols, rowInputsConstructor, initialValue) {
    this.name = name;
    this.cols = cols;
    this.rowInputsConstructor = rowInputsConstructor;
    this.initialValue = initialValue;
  }

  createElementIn(parentEl) {
    this.element = document.createElement("table");
    const caption = document.createElement("caption");
    caption.innerText = this.name;
    this.element.appendChild(caption);

    const tr = document.createElement("tr");
    this.element.appendChild(tr);

    for (const col of this.cols) {
      const th = document.createElement("th");
      th.innerText = col;
      tr.appendChild(th);
    }

    parentEl.appendChild(this.element);

    //need to have this fn to be able to create new rows of data
    if (this.rowInputsConstructor) {
      //event handler
      addNewRowOnDataEntry(this);
      //create the initial rows passed from initialValue
      for (const obj of this.initialValue) {
        this.rowInputsConstructor(obj);
      }
    }
  }

  addRowValues(inputTypes) {
    const tr = document.createElement("tr");
    this.element.appendChild(tr);

    for (const inputType of inputTypes) {
      const td = document.createElement("td");
      inputType.createElementIn(td);
      tr.appendChild(td);
    }

    this.rows.push({tr, inputTypes});
  }

  destroy() {
    this.element.remove();
  }
}

function addNewRowOnDataEntry(table) {
  table.element.addEventListener('input', (e) => {
    const lastRow = table.rows[table.rows.length - 1];
    if (!lastRow) return;
    for (const inputType of lastRow.inputTypes) {
      //if any input in lastRow is not null, it's being used and we need a new one
      if (inputType.getValue() !== null) {
        table.rowInputsConstructor();
        return;
      }
    }
    // if last 2 rows are empty, delete the last row
    const secondLastRow = table.rows[table.rows.length - 2];
    if (!secondLastRow) return;
    for (const inputType of secondLastRow.inputTypes) {
      if (inputType.getValue() !== null) return;
    }
    //  all second row is initial value too so delete last row
    lastRow.tr.remove();
    lastRow.inputTypes.forEach(inputType => inputType.destroy());
    table.rows.pop();
  });
}
