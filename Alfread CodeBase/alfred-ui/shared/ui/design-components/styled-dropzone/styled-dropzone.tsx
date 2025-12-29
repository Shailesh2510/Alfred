import React from "react";
import { StyledDropzoneComponent } from "./styled-dropzone.style";

const StyledDropzone: any = ({ children, ...props }: any) => {
  return <StyledDropzoneComponent {...props}>{children}</StyledDropzoneComponent>;
};

export default StyledDropzone;
