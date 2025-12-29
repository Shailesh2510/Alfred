import { isArray, isEmpty, omit, set } from "lodash";
import { useRouter } from "next/router";

const useQueryString = () => {
  const router = useRouter();

  return async (entries: any) => {
    const newQueryString = {};
    const queryStringToRemove: any[] = [];

    entries.forEach(({ value, fieldName }: any) => {
      if (isEmpty(value) || (isArray(value) && value.some((el) => !el))) {
        queryStringToRemove.push(fieldName);
      } else {
        let valueToAdd = isArray(value) ? value?.join(",") : value;
        set(newQueryString, fieldName, valueToAdd);
      }
    });

    router.replace({
      query: omit({ ...router.query, ...newQueryString }, queryStringToRemove),
    });
  };
};

export default useQueryString;
