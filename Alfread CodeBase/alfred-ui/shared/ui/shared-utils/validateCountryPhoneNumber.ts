import { phone } from "phone";

const validateCountryPhoneNumber = (phoneNumber: string) => {
  if (phoneNumber.length === 0) {
    return "Phone number is required";
  }

  const isValidPhoneNumber = phone(phoneNumber).isValid;
  if (isValidPhoneNumber) {
    return null;
  }

  return "Please enter a valid phone number";
};

export default validateCountryPhoneNumber;
