import React from "react";
import { colors, typography } from "@/design-system";
import { Input } from "@mantine/core";
import PhoneInput from "react-phone-input-2";

const StyledCountryPhoneNumber = ({
  onChange,
  isDisabled = false,
  value,
  label,
  name,
  countryCodeEditable = false,
  onKeyDown,
  error,
}: any) => {
  return (
    <>
      <Input.Wrapper style={{ margin: "2px 0px" }} label={label} required error={error}>
        <PhoneInput
          onKeyDown={onKeyDown}
          disabled={isDisabled}
          country={"us"}
          placeholder="(---) --- ----"
          enableSearch={true}
          disableSearchIcon={true}
          value={value}
          onChange={onChange}
          inputProps={{
            label: label,
            name: name,
          }}
          searchPlaceholder="Search Country"
          preferredCountries={["us"]}
          countryCodeEditable={countryCodeEditable}
          containerStyle={{ width: "100%" }}
          inputStyle={{ width: "100%", borderRadius: "4px", ...typography.sm400, color: colors.gray[9] }}
          searchStyle={{ width: "90%", borderRadius: "4px", ...typography.sm400, color: colors.gray[9] }}
        />
      </Input.Wrapper>
    </>
  );
};

export default StyledCountryPhoneNumber;
