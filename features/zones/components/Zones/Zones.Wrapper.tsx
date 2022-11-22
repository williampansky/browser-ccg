import React, { ReactElement, useEffect, useState } from 'react';
import { GameState, Zone } from '../../../../types';
// import { ZoneSlot } from '../ZoneSlot/ZoneSlot';
// import { ZoneDropSlot } from '../ZoneDropSlot/ZoneDropSlot';
import type { RootState } from '../../../../store';
import { useSelector, useDispatch } from 'react-redux';
import { Zone as ZoneComponent } from '../Zone';
import { useEffectListener, useLatestPropsOnEffect } from 'bgio-effects/react';
import { initZone, updateZoneSide } from '../../zones.slice';
import { updateZonesRef } from '../../zones-ref.slice';
import styles from './zones.wrapper.module.scss';
import { Ctx } from 'boardgame.io';
import { EffectsCtxMixin } from 'bgio-effects/dist/types';
import bgioEffectsConfig from '../../../../game/config.bgio-effects';
import { ZoneDropSlot } from '../ZoneDropSlot';

interface ReactZones {
  // G: GameState;
  // ctx: Ctx;
  // moves: any;
  // disabled: boolean;
  // zone: ZoneProps;
  // zoneNumber: number;
  player: string;
  opponent: string;
  // onCardClick: (obj: Card) => void;
}

export const Zones = ({ player, opponent }: ReactZones): ReactElement => {
  // const { powers } = zone;
  // const { playCard } = moves;

  const dispatch = useDispatch();
  const { G, ctx } = useLatestPropsOnEffect<GameState, any>('effects:end');
  const {gameConfig} = useSelector((state: RootState) => state.config);
  const zones = useSelector((state: RootState) => state.zones);
  const zonesRef = useSelector((state: RootState) => state.zonesRef);
  const [zonesAreActive, setZonesAreActive] = useState<boolean>(false);
  const [cardType, setCardType] = useState<string | undefined>(undefined);

  useEffect(() => {
    G.zones.forEach((z: Zone, i: number) => {
      // if (z.revealed) 
      dispatch(initZone({
        zoneData: G.zones[i],
        zoneNumber: i
      }))
    })
  }, [G.zones]);

  useEffect(() => {
    dispatch(updateZonesRef(G.zonesCardsReference));
  }, [G.zonesCardsReference]);

  // useEffectListener('revealCard', (effectPayload: any, boardProps: any) => {
  //   dispatch(updateZoneSide({
  //     zoneNumber: effectPayload.zoneNumber,
  //     cardData: effectPayload.card,
  //     player: effectPayload.player
  //   }))
  // }, [G.zones]);

  useEffect(() => {
    setTimeout(() => {
      setZonesAreActive(G.selectedCardData[player] !== undefined);
      setCardType(G.selectedCardData[player]?.type);
    }, 100);
  }, [G.selectedCardData[player]]);

  // useEffect(() => {
  //   console.log(G)
  // }, [G]);

  return (
    <div className={styles['wrapper']}>
      {zones.map((zone: Zone, idx: number) => {
        return (
          <ZoneComponent
            // G={G}
            // ctx={ctx}
            // moves={moves}
            // disabled={zone.disabled[0]}
            zone={zone}
            zoneNumber={idx}
            zonesAreActive={zonesAreActive}
            zoneRef={zonesRef[idx]}
            key={idx}
            // onCardClick={onCardClick}
            player={player}
            opponent={opponent}
            turn={G.turn}
            gameConfig={gameConfig}
          />
        );
      })}
    </div>
  );
};
