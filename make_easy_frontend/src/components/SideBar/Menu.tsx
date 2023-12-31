import React, { forwardRef, LegacyRef } from 'react';
import classNames from 'classnames';

export type IconShape = 'square' | 'round' | 'circle';

export type Props = React.HTMLAttributes<HTMLElement> & {
  className?: string;
  children?: React.ReactNode;
  iconShape?: IconShape;
  popperArrow?: boolean;
  subMenuBullets?: boolean;
  innerSubMenuArrows?: boolean;
  hasSubmenu:boolean;
};

const Menu: React.ForwardRefRenderFunction<unknown, Props> = (
  {
    children,
    className,
    iconShape,
    hasSubmenu,
    popperArrow = false,
    subMenuBullets = false,
    innerSubMenuArrows = true,
    ...rest
  },
  ref,
) => {
  const menuRef: LegacyRef<HTMLElement> = (ref as any) || React.createRef<HTMLElement>();
  return (
    <nav
      ref={menuRef}
      className={classNames('pro-menu', className, {
        [`shaped ${iconShape}`]: ['square', 'round', 'circle'].indexOf('circle') >= 0,
        'submenu-bullets': subMenuBullets,
        'inner-submenu-arrows': innerSubMenuArrows,
      })}
      {...rest}
    >
      <ul className={hasSubmenu ? "collapse-multilevel-menu" : ""}>
        {React.Children.toArray(children)
          .filter(Boolean)
          .map((child, index) =>
            React.cloneElement(child as React.ReactElement, {
              key: index,
              firstchild: 1,
              popperarrow: popperArrow === true ? 1 : 0,
            }),
          )}
      </ul>
    </nav>
  );
};

export default forwardRef<unknown, Props>(Menu);