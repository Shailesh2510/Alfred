import React from "react";
import { StyledModalComponent, ModalBody, ModalFooter } from "./styled-modal.style";

const StyledModal: any = ({ modalBody, modalFooter, showHeader = true, mih, ...props }: any) => {
  return (
    <StyledModalComponent showHeader={showHeader} {...props}>
      {modalBody ? <ModalBody mih={mih}>{modalBody}</ModalBody> : null}
      {modalFooter ? <ModalFooter>{modalFooter}</ModalFooter> : null}
    </StyledModalComponent>
  );
};

export default StyledModal;
