import { Fragment } from 'react';
import styles from './ZoneDropSlot.module.scss';

interface Props {
  isActive: boolean;
  zoneNumber?: number;
}

export const ZoneDropSlot = ({ isActive, zoneNumber }: Props) => {
  const wrapperStyles = [
    styles['wrapper'],
    zoneNumber === undefined ? styles['global-spell'] : '',
    isActive ? styles['active'] : '',
  ].join(' ');

  const buttonStyles = [
    styles['button'],
    zoneNumber === undefined ? styles['global-spell'] : '',
    isActive ? styles['active'] : '',
  ].join(' ');

  return (
    <Fragment>
      <div data-drop className={wrapperStyles} />
      <div
        role='button'
        tabIndex={0}
        data-receive={true}
        data-index={zoneNumber}
        className={buttonStyles}
      />
    </Fragment>
  );
};
