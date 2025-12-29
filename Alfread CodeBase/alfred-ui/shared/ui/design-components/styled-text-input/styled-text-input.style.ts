import styled from "@emotion/styled";
import { TextInput } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledTextInputContainer: any = styled(TextInput)`
  .mantine-TextInput-label {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-TextInput-required {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-TextInput-input {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
`;

export default StyledTextInputContainer;
