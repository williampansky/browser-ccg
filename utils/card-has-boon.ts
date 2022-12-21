import type { Card } from "../types";
import { Mechanics } from "../enums";

export default function cardHasBoon(card: Card) {
  return card.mechanics?.includes(Mechanics.Boon);
}
