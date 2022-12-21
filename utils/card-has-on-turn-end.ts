import type { Card } from "../types";
import { Mechanics } from "../enums";

export default function cardHasOnTurnEnd(card: Card) {
  return card.mechanics?.includes(Mechanics.OnTurnEnd);
}
