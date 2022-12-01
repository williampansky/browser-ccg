import { subtract } from "mathjs";
import { Card, GameState, PlayerID } from "../types";
import cardIsNotSelf from "./card-is-not-self";
import getContextualPlayerIds from "./get-contextual-player-ids";
import pushHealthStreamAndSetDisplay from "./push-healthstream-and-set-display";

const dealAoeDamage = (G: GameState, player: PlayerID, card: Card) => {
  const { numberPrimary } = card;
  const { opponent } = getContextualPlayerIds(player);
  let onPlayWasTriggered: boolean = false;

  G.zones.forEach((z) => {
    z.sides[player].forEach((c) => {
      if (cardIsNotSelf(c, card)) {
        onPlayWasTriggered = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });

    z.sides[opponent].forEach((c) => {
      if (cardIsNotSelf(c, card)) {
        onPlayWasTriggered = true;
        pushHealthStreamAndSetDisplay(
          c,
          card,
          numberPrimary,
          subtract(c.displayHealth, numberPrimary)
        );
      }
    });
  });

  if (onPlayWasTriggered) {
    card.booleans.onPlayWasTriggered = true;
  }
}

export default dealAoeDamage;
