import React from "react";
import StyledButtonComponent from "./styled-button.style";

const StyledButton: any = ({ height = 40, width = "fit-content", font = "md600", ...props }: any) => {
  return <StyledButtonComponent height={height} width={width} font={font} {...props} />;
};

export default StyledButton;
