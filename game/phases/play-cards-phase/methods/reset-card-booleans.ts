import { Card } from "../../../../types";

const resetCardBooleans = (card: Card) => {
  card.booleans = {
    ...card.booleans,
    canBeAttackedBySpell: false,
    canBeAttackedByWeapon: false,
    canBeBuffed: false,
    canBeDestroyed: false,
    canBeHealed: false,
    eventWasTriggered: false,
  };
};

export default resetCardBooleans;
