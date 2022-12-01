import { Card } from "../types";

export default function cardIsNotSelf(card1: Card, card2: Card): boolean {
  return card1.uuid !== card2.uuid;
}
