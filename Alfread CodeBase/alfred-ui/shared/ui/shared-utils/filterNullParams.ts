const filterNullParams = (params: any) => {
  return Object.fromEntries(Object.entries(params).filter(([_, v]) => v != null && v != ""));
};

export default filterNullParams;
