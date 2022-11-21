import { Card } from "../types";

const getDeckbuilderDeckLength = (array: Card[]): number => {
  let amount = 0;
  
  array?.forEach((obj: Card) => {
    if (obj?.amount) amount = Math.abs(amount + obj?.amount);
    else Math.abs(amount + 1);
  });

  return amount;
}

export default getDeckbuilderDeckLength;
