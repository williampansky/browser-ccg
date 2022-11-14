import React from 'react';
import type { ReactElement } from 'react';
import styles from './zone-drop-slot.module.scss';

interface ReactZoneDropSlot {
  isActive: boolean;
  zoneNumber: number;
}

export const ZoneDropSlot = ({
  isActive,
  zoneNumber,
}: ReactZoneDropSlot): ReactElement => {
  const wrapperStyles = [styles['wrapper'], isActive ? styles['active'] : ''];
  const buttonStyles = [styles['button'], isActive ? styles['active'] : ''];

  return (
    <React.Fragment>
      <div data-drop className={wrapperStyles.join(' ')} />
      <div
        role="button"
        tabIndex={0}
        data-receive={true}
        data-index={zoneNumber}
        className={buttonStyles.join(' ')}
      />
    </React.Fragment>
  );
};
