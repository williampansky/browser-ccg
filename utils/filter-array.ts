import { Card } from "../types";

const filterArray = (array: any[], key: string, idx: number) => {
  for (var i = array.length - 1; i >= 0; --i) {
    if (array[i].uuid === key && i === idx) {
      array.splice(i, 1);
    }
  }
}

export default filterArray;
