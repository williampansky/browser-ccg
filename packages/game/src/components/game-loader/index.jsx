import React from 'react';
import styles from './styles.module.scss';

/**
 * @see https://codepen.io/duanhongchang/pen/fwigG
 */
export default function GameLoader() {
  return (
    <div className={styles['loader']}>
      <div className={styles['ellipsis']}>Loading</div>
    </div>
  );
}
