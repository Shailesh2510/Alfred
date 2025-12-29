import React from "react";
import StyledBadgeComponent from "./styled-badge.style";

const StyledBadge: any = ({ font = "sm500", showPointer, ...props }: any) => {
  return <StyledBadgeComponent font={font} showPointer={showPointer} {...props} />;
};

export default StyledBadge;
