import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { slide as Menu } from 'react-burger-menu';
import { AppIcon } from '@ccg/components';
// import { getIcon } from '@ccg/utils';
import styles from './styles.module.scss';

/**
 * @requires react-burger-menu
 * @see https://github.com/negomi/react-burger-menu
 */
const ReactBurgerMenu = props => {
  const { children, isDesktop, isOpen, onStateChange, side } = props;
  return (
    <Fragment>
      <Menu
        customBurgerIcon={false}
        bodyClassName={'react-burger-menu-bodyClassName'}
        disableAutoFocus
        disableCloseOnEsc
        isOpen={isOpen}
        onStateChange={onStateChange}
        right={side === 'right' ? true : false}
      >
        {children}
      </Menu>
    </Fragment>
  );
};

ReactBurgerMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool.isRequired,
  onStateChange: PropTypes.func.isRequired,
  side: PropTypes.string
};

ReactBurgerMenu.defaultProps = {
  isOpen: false,
  onStateChange: () => {},
  side: 'left'
};

export default ReactBurgerMenu;
