import Image from 'next/image';
import Link from 'next/link';
import { Fragment, ReactNode } from 'react';
import { siteConfig } from '../../../app.config';
// const { breakpoints } = siteConfig;

interface ContainerProps {
  children?: ReactNode;
}

export const Container = ({ children }: ContainerProps) => (
  <div className='site__container'>
    {children}
  </div>
);
