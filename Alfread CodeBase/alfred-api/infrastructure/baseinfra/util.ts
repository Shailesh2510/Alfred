require("dotenv").config();
export const getEnvironment = () => {
  if (!process.env.STAGE) {
    throw new Error(`Stage missing`);
  }
  if (!process.env.AWS_ACCOUNT) {
    throw new Error(`Account missing`);
  }
  if (!process.env.AWS_REGION) {
    throw new Error(`Region missing`);
  }
  const env = {
    stage: process.env.STAGE,
    account: process.env.AWS_ACCOUNT,
    region: process.env.AWS_REGION,
  };
  return env;
};
