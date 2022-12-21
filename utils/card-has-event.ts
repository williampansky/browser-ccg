import type { Card } from "../types";
import { Mechanics } from "../enums";

export default function cardHasEvent(card: Card) {
  return card.mechanics?.includes(Mechanics.Event);
}
