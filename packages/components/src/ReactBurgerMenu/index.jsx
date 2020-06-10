import React, { Fragment } from 'react';
import PropTypes from 'prop-types';
import { slide as Menu } from 'react-burger-menu';
import { AppIcon } from '@ccg/components';
// import { getIcon } from '@ccg/utils';
import styles from './styles.module.scss';

/**
 * @requires react-burger-menu
 */
const ReactBurgerMenu = ({ children, isOpen = false, onStateChange }) => {
  return (
    <Fragment>
      <Menu
        customBurgerIcon={false}
        bodyClassName={'react-burger-menu-bodyClassName'}
        disableAutoFocus
        disableCloseOnEsc
        isOpen={isOpen}
        onStateChange={onStateChange}
        right
      >
        {children}
      </Menu>
    </Fragment>
  );
};

ReactBurgerMenu.propTypes = {
  children: PropTypes.node.isRequired,
  isOpen: PropTypes.bool,
  onStateChange: PropTypes.func.isRequired
};

ReactBurgerMenu.defaultProps = {
  onStateChange: () => {}
};

export default ReactBurgerMenu;
