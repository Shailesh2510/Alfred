import styled from "@emotion/styled";
import { DatePicker } from "@mantine/dates";
import { colors, typography } from "@/design-system";

const StyledDatePickerContainer: any = styled(DatePicker)`
  .mantine-DatePicker-placeholder {
    color: ${colors.gray[6]};
    ${typography.sm400};
  }
  .mantine-DatePicker-input {
    border-radius: 4px;
    ${typography.sm400};
  }
  [data-weekend] {
    color: ${colors.black};
  }
`;

export default StyledDatePickerContainer;
