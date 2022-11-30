import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useEffectListener, useLatestPropsOnEffect } from 'bgio-effects/react';

import type { RootState } from '../../../../store';
import type { GameState, PlayerID, Zone } from '../../../../types';

import { initZone, updateZoneSide } from '../../zones.slice';
import { Zone as ZoneComponent } from '../Zone';
import styles from './zones.wrapper.module.scss';

interface ZonesProps {
  moves: any;
  yourID: PlayerID;
  theirID: PlayerID;
}

export const Zones = ({ yourID, theirID, moves }: ZonesProps) => {
  const dispatch = useDispatch();
  const { G, ctx } = useLatestPropsOnEffect<GameState, any>('effects:end');
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
    setTimeout(() => {
      setZonesAreActive(G.selectedCardData[yourID] !== undefined);
      setCardType(G.selectedCardData[yourID]?.type);
    }, 100);
  }, [G.selectedCardData[yourID], yourID]);

  return (
    <div className={styles['wrapper']}>
      {G.zones.map((zone: Zone, idx: number) => {
        return (
          <ZoneComponent
            moves={moves}
            zone={zone}
            zoneNumber={idx}
            zonesAreActive={zonesAreActive}
            key={idx}
            yourID={yourID}
            theirID={theirID}
            turn={G.turn}
            gameConfig={gameConfig}
          />
        );
      })}
    </div>
  );
};
