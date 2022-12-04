import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectListener, useLatestPropsOnEffect } from 'bgio-effects/react';

import type { RootState } from '../../../store';
import type { Card, GameState, PlayerID } from '../../../types';

import { Zone } from './Zone';
import styles from './TheZonesContainer.module.scss';
import { Ctx } from 'boardgame.io';

interface Props {
  ctx: Ctx;
  G: GameState;
  moves: any;
  theirID: PlayerID;
  yourID: PlayerID;
  onAttackMinionClick: (zS?: PlayerID, c?: Card) => void
  onHealMinionClick: (zS?: PlayerID, c?: Card) => void
}

export const TheZonesContainer = ({
  ctx,
  G,
  moves,
  theirID,
  yourID,
  onAttackMinionClick,
  onHealMinionClick
}: Props) => {
  const { lastMoveMade, selectedCardData } = G;
  const yourCard = selectedCardData[yourID];

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

  useEffect(() => {
    if (lastMoveMade === 'selectCard') {
      setZonesAreActive(true);
      setCardType(yourCard?.type);
    } else {
      setZonesAreActive(false);
      setCardType(undefined);
    }
  }, [yourCard, lastMoveMade]);

  return (
    <div className={styles['wrapper']}>
      {G.zones.map((zone, idx) => {
        return (
          <Zone
            moves={moves}
            zone={zone}
            zoneNumber={idx}
            zonesAreActive={zonesAreActive}
            key={idx}
            yourID={yourID}
            theirID={theirID}
            turn={G.turn}
            gameConfig={gameConfig}
            onAttackMinionClick={onAttackMinionClick}
            onHealMinionClick={onHealMinionClick}
          />
        );
      })}
    </div>
  );
};
