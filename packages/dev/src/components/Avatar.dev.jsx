/* eslint-disable no-unused-vars */
import React from 'react';
import { Avatar } from '@ccg/components';
import { PLACEHOLDER_IMAGE } from '@ccg/images';
import { getHeroImage, getHeroName } from '@ccg/utils';

export default function AvatarDev() {
  const HERO_SYMBOL = '%HERO_ZEUS%';

  return (
    <div id="app">
      <Avatar
        heroImageSrc={getHeroImage(HERO_SYMBOL, 'AVATAR')}
        heroName={getHeroName(HERO_SYMBOL)}
        placeholderImageSrc={PLACEHOLDER_IMAGE}
      />
    </div>
  );
}
