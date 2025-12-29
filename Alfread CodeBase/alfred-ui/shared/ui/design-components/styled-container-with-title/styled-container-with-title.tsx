import React from "react";
import { StyledContainer, StyledTitle } from "./styled-container-with-title.style";

const StyledContainerWithTitle: any = ({ title, children }: any) => {
  return (
    <StyledContainer>
      <StyledTitle>{title}</StyledTitle>
      {children}
    </StyledContainer>
  );
};

export default StyledContainerWithTitle;
