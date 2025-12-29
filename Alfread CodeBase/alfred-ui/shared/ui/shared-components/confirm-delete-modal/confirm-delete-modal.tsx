import React from "react";
import { Flex } from "@mantine/core";
import { StyledButton, StyledModal } from "../../design-components";

const ConfirmDeleteModal = ({ title, message, modalOpen, setModalOpen, onClose, onDelete }: any) => {
  return (
    <StyledModal
      opened={modalOpen}
      title={title}
      onClose={() => setModalOpen(false)}
      modalBody={message}
      modalFooter={
        <Flex justify="space-between">
          <StyledButton
            color="dark"
            variant="outline"
            onClick={() => {
              setModalOpen(false);
              onClose();
            }}
          >
            Close
          </StyledButton>
          <StyledButton
            color="red"
            onClick={() => {
              setModalOpen(false);
              onDelete();
            }}
          >
            Remove
          </StyledButton>
        </Flex>
      }
    />
  );
};

export default ConfirmDeleteModal;
