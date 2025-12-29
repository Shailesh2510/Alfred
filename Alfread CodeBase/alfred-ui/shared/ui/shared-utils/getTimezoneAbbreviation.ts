const getTimezoneAbbreviation = (timeZone: string) => {
  const opts: any = { timeZoneName: "short", timeZone };
  return Intl.DateTimeFormat("en-EN", opts).format(Date.now()).split(",")[1]?.toString()?.trim();
};

export default getTimezoneAbbreviation;
