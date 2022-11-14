import { Card } from '../../types';
import getCardPower from '../get-card-power';

const describe1 = 'Basic power calculation for a card';
describe(describe1, () => {
  test('card.powerOverride', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerOverride: 10,
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 0,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(10);
  });

  test("card's latest powerStream.currentPower", () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [
        {
          blame: 'CARD_TEST',
          adjustment: 2,
          currentPower: 4,
        },
      ],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 0,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(4);
  });

  test('card.basePower', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 0,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(2);
  });
});

const describe2 = 'Power calc for a card with a positive zone adjustment value';
describe(describe2, () => {
  test('card.powerOverride + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerOverride: 10,
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(11);
  });

  test("card's latest powerStream.currentPower + card.zonePowerAdjustment", () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [
        {
          blame: 'CARD_TEST',
          adjustment: 2,
          currentPower: 4,
        },
      ],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(5);
  });

  test('card.basePower + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: 1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(3);
  });
});

const describe3 = 'Power calc for a card with a negative zone adjustment value';
describe(describe3, () => {
  test('card.powerOverride + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerOverride: 10,
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(9);
  });

  test("card's latest powerStream.currentPower + card.zonePowerAdjustment", () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [
        {
          blame: 'CARD_TEST',
          adjustment: 2,
          currentPower: 4,
        },
      ],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(3);
  });

  test('card.basePower + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -1,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(1);
  });
});

const describe4 = 'Power calc with a large negative zone adjustment value';
describe(describe4, () => {
  test('card.powerOverride + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerOverride: 10,
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -15,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(-5);
  });

  test("card's latest powerStream.currentPower + card.zonePowerAdjustment", () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 0,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [
        {
          blame: 'CARD_TEST',
          adjustment: 1,
          currentPower: 1,
        },
      ],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -3,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(-2);
  });

  test('card.basePower + card.zonePowerAdjustment', () => {
    const card = {
      id: 'CARD_TEST',
      baseCost: 1,
      basePower: 2,
      canPlay: false,
      currentCost: 1,
      displayPower: 2,
      name: 'Test Cardster',
      powerStream: [],
      revealed: false,
      uuid: '12345',
      zonePowerAdjustment: -3,
      type: 'CARD',
      revealedOnTurn: 0,
    } as Card;

    const fn = getCardPower(card);
    expect(fn).toEqual(-1);
  });
});
