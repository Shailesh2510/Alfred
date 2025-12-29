import styled from "@emotion/styled";
import { Textarea } from "@mantine/core";
import { colors, typography } from "@/design-system";

const StyledTextareaComponent: any = styled(Textarea)`
  .mantine-Textarea-label {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-Textarea-required {
    margin-bottom: 4px;
    ${typography.sm600};
  }
  .mantine-Textarea-input {
    border-radius: 4px;
    ${typography.sm400};
    color: ${colors.gray[9]};
  }
  input::placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
`;

export default StyledTextareaComponent;
