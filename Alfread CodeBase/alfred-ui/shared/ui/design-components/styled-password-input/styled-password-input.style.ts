import styled from "@emotion/styled";
import { PasswordInput } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledPasswordInputContainer: any = styled(PasswordInput)`
  .mantine-PasswordInput-label {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-PasswordInput-required {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-PasswordInput-input {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
`;

export default StyledPasswordInputContainer;
