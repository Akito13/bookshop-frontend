import React, { forwardRef } from "react";
import { NavLink, NavLinkProps } from "react-router-dom";

interface CustomNavLinkProps extends NavLinkProps {
  activeClassName?: string;
}

const CustomNavLink = forwardRef<HTMLAnchorElement, CustomNavLinkProps>(
  (props, ref) => {
    return (
      <NavLink
        ref={ref}
        {...props}
        // st
        // className={({ isActive }) =>
        //   `${props.className} ${isActive ? props.activeClassName : ""}`
        // }
      />
    );
  }
);

export default CustomNavLink;
