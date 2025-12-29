import styled from "@emotion/styled";
import { NumberInput } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledNumberInput: any = styled(NumberInput)`
  .mantine-NumberInput-label {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-NumberInput-required {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-NumberInput-input {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
`;

export default StyledNumberInput;
