import React from "react";
import { StyledDividerComponent } from "./styled-divider.style";

const StyledDivider: any = ({ font = "sm700", ...props }) => {
  return <StyledDividerComponent {...props} font={font} />;
};

export default StyledDivider;
