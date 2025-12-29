import React from "react";
import StyledNumberInputComponent from "./styled-number-input.style";

const StyledNumberInput: any = ({ ...props }: any) => {
  return <StyledNumberInputComponent hideControls={true} {...props} />;
};
export default StyledNumberInput;
