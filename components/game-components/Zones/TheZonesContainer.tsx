import React, { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectListener, useLatestPropsOnEffect } from 'bgio-effects/react';

import type { Ctx } from 'boardgame.io';
import type { RootState } from '../../../store';
import type { Card, GameState, PlayerID } from '../../../types';

import { Zone } from './Zone';
import { LastMoveMade } from '../../../enums';

import {
  AttackMinionMove,
  BuffMinionMove,
  DebuffMinionMove,
  DestroyMinionMove,
  HealMinionMove,
} from '../../../game/moves';

import styles from './TheZonesContainer.module.scss';

interface Props {
  ctx: Ctx;
  G: GameState;
  moves: any;
  theirID: PlayerID;
  yourID: PlayerID;
  onAttackMinionClick: ({ card, targetPlayer }: AttackMinionMove) => void;
  onBuffMinionClick: ({ card, targetPlayer }: BuffMinionMove) => void;
  onDebuffMinionClick: ({ card, targetPlayer }: DebuffMinionMove) => void;
  onDestroyMinionClick: ({ card, targetPlayer }: DestroyMinionMove) => void;
  onHealMinionClick: ({ card, targetPlayer }: HealMinionMove) => void;
}

export const TheZonesContainer = ({
  ctx,
  G,
  moves,
  theirID,
  yourID,
  onAttackMinionClick,
  onBuffMinionClick,
  onDebuffMinionClick,
  onDestroyMinionClick,
  onHealMinionClick,
}: Props) => {
  const { lastMoveMade, selectedCardData } = G;

  const dispatch = useDispatch();
  const { gameConfig } = useSelector((state: RootState) => state.config);
  const [zonesAreActive, setZonesAreActive] = useState<boolean>(false);
  const [_, setCardType] = useState<string | undefined>(undefined);
  const zones = useSelector((state: RootState) => state.zones);

  // useEffect(() => {
  //   // prettier-ignore
  //   G.zones.forEach((z: Zone, i: number) => {
  //     if (z.revealed) dispatch(initZone({
  //       zoneData: G.zones[i],
  //       zoneNumber: i
  //     }))
  //   })
  // }, [G.zones]);

  const handleZonesAreActive = useCallback((move?: string, card?: Card) => {
    switch (move) {
      case LastMoveMade.SelectCard:
        if (card !== undefined) return setZonesAreActive(true);
        else return setZonesAreActive(false);

      default:
        return setZonesAreActive(false);
    }
  }, []);

  useEffect(() => {
    handleZonesAreActive(lastMoveMade, selectedCardData[yourID]);
  }, [lastMoveMade, selectedCardData[yourID]]);

  return (
    <div className={styles['wrapper']}>
      {G.zones.map((zone, idx) => {
        return (
          <Zone
            moves={moves}
            zone={zone}
            zoneNumber={idx}
            zonesAreActive={zonesAreActive}
            key={zone.id || idx}
            yourID={yourID}
            theirID={theirID}
            turn={G.turn}
            gameConfig={gameConfig}
            onAttackMinionClick={onAttackMinionClick}
            onBuffMinionClick={onBuffMinionClick}
            onDebuffMinionClick={onDebuffMinionClick}
            onDestroyMinionClick={onDestroyMinionClick}
            onHealMinionClick={onHealMinionClick}
          />
        );
      })}
    </div>
  );
};
