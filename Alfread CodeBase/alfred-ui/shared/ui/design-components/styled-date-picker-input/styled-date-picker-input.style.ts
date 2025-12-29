import styled from "@emotion/styled";
import { DatePickerInput } from "@mantine/dates";
import { colors, typography } from "@/design-system";

const StyledDatePickerInputContainer: any = styled(DatePickerInput)`
  .mantine-DatePickerInput-placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
  .mantine-DatePickerInput-input {
    border-radius: 4px;
    ${typography.sm400};
  }
  [data-weekend] {
    color: ${colors.black};
  }
`;

export default StyledDatePickerInputContainer;
