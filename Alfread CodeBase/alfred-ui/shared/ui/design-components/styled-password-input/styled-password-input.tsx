import React from "react";
import StyledPasswordInputContainer from "./styled-password-input.style";

const StyledPasswordInput: any = ({ children, ...props }: any) => {
  return <StyledPasswordInputContainer {...props}>{children}</StyledPasswordInputContainer>;
};

export default StyledPasswordInput;
