import React from "react";
import StyledTextInputContainer from "./styled-text-input.style";

const StyledTextInput: any = ({ children, ...props }: any) => {
  return <StyledTextInputContainer {...props}>{children}</StyledTextInputContainer>;
};

export default StyledTextInput;
