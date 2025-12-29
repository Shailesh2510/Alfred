import React from "react";
import StyledTabComponent from "./styled-tab.style";

const StyledTab: any = ({ children, ...props }: any) => {
  return <StyledTabComponent {...props}>{children}</StyledTabComponent>;
};

export default StyledTab;
