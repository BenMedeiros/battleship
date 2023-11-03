'use strict';

//format date object to be YYYY-MM-DD
export function formatDate(obj) {
  if (!obj) return null;

  if (obj instanceof Date) {
    // note that html input[date] requires the padding
    const result = obj.getUTCFullYear() + '-'
      + String(obj.getUTCMonth() + 1).padStart(2, '0') + '-'
      + String(obj.getUTCDate()).padStart(2, '0');
    // console.log(result);
    return result;
  } else if (typeof obj === 'string') {
    return obj.substring(0, 10);
  } else {
    throw new Error('Date field initial value must be Date or YYYY-MM-DD string.');
  }
}
