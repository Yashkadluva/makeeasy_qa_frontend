import React, { forwardRef, LegacyRef, useContext } from "react";
import { SidebarContext } from "./ProSidebar";
import { useNavigate } from "react-router-dom";
import { Dispatch } from "redux";
import { useDispatch, useSelector } from "react-redux";
import { PAGE_ACTIVE, setDataInRedux } from "../../action/CommonAction";
import { RootState } from "../../config/Store";
import { PageActiveState } from "../../reducer/CommonReducer";
import HelperService, { getCurrentPage } from "../../utility/HelperService";

export type Props = React.LiHTMLAttributes<HTMLLIElement> & {
  children?: React.ReactNode;
  className?: string;
  icon?: string;
  active?: boolean;
  prefix?: React.ReactNode;
  suffix?: React.ReactNode;
  firstchild?: boolean;
  popperarrow?: boolean;
  url?: string;
};

const MenuItem: React.ForwardRefRenderFunction<unknown, Props> = (
  {
    children,
    className,
    icon,
    active,
    prefix,
    suffix,
    firstchild,
    popperarrow,
    url,
    ...rest
  },
  ref
) => {
  const menuItemRef: LegacyRef<HTMLLIElement> =
    (ref as any) || React.createRef<HTMLLIElement>();

  const { collapsed } = useContext(SidebarContext);
  let history = useNavigate();
  const dispatch: Dispatch<any> = useDispatch();
  const currentPage: any = useSelector<RootState, PageActiveState>(
    (state) => state.pageActive
  );

  const onMenuClick = () => {
    history(`${url}`);
    if (url) {
      dispatch(
        setDataInRedux({
          type: PAGE_ACTIVE,
          value: getCurrentPage(url) as string,
        })
      );
    }
  };

  return (
    <li
      ref={menuItemRef}
      className={
        "pro-menu-item " + (children === currentPage.title ? "active" : "")
      }
      {...rest}
      onClick={() => onMenuClick()}
    >
      <div
        className={
          "pro-inner-item " + (children === currentPage.title ? "active" : "")
        }
        tabIndex={0}
        role="button"
      >
        <span className="pro-icon-wrapper">
          <span
            className={
              "pro-icon " +
              (children === currentPage.title ? "active" : "") +
              (firstchild ? "" : "sa-menu-icon")
            }
          >
            {icon ? (
              <img
                src={icon}
                className={
                  children === currentPage.title ? "sa-menu-active-icon" : ""
                }
              />
            ) : (
              ""
            )}
          </span>
        </span>
        {prefix ? <span className="prefix-wrapper">{prefix}</span> : null}
        <span
          className={"pro-item-content " + (firstchild ? "" : "sa-submenu")}
        >
          {children}
        </span>
        {suffix ? <span className="suffix-wrapper">{suffix}</span> : null}
      </div>

      {firstchild && collapsed ? <div className="sa-menu">{children}</div> : ""}
    </li>
  );
};

export default forwardRef<unknown, Props>(MenuItem);
