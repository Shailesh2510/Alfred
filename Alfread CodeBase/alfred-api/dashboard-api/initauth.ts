import {
  CognitoIdentityProviderClient,
  AdminRespondToAuthChallengeCommand,
  ChallengeNameType,
} from '@aws-sdk/client-cognito-identity-provider';

const authenticationData = {
  username: 'zhuriendrit@gmail.com',
  password: 'Changeme123!',
  clientId: '7c4d3tc9nmvo199dmroj1qph14',
  userPoolId: 'us-east-1_7oCdBm4Mk',
  session:
    'AYABeEhcpR_prieU7DRukPtziqEAHQABAAdTZXJ2aWNlABBDb2duaXRvVXNlclBvb2xzAAEAB2F3cy1rbXMAS2Fybjphd3M6a21zOnVzLWVhc3QtMTo3NDU2MjM0Njc1NTU6a2V5L2IxNTVhZmNhLWJmMjktNGVlZC1hZmQ4LWE5ZTA5MzY1M2RiZQC4AQIBAHiG0oCCDoro3IaeecGyxCZJOVZkUqttbPnF4J7Ar-5byAGf1JAOUK1g_DB95n2Xx5MNAAAAfjB8BgkqhkiG9w0BBwagbzBtAgEAMGgGCSqGSIb3DQEHATAeBglghkgBZQMEAS4wEQQMXdKUTBMfXrFmx2hAAgEQgDuwIbMokD7aXXZfQvxhpN_6X7-rH51bRPgpw0L3-jDjDA1xkDrkX8oQh_J0_vlsj1ASvz6wXgyjVSj2iAIAAAAADAAAEAAAAAAAAAAAAAAAAAB2x3Efv2NxoQtKKLsVFyDO_____wAAAAEAAAAAAAAAAAAAAAEAAADGavI8_P6ZHx1hbnfEZ0im3as6uTVXO07-FMkND57kwRsbpXJ0Wn7iGyH5yD46r2tMRFMvVXY5tv2d5BiPuzQacB6Y6NBThITMKfS_tPOUC0JrtPZqqZ1OdxzQWYiKRKTZBrewp27cHPOCTg6m-26QctzaDJFTf_2MXNwgSd0yWsicSVRAXFxzuvpeSa_zri0Ki8ZW4Y6nO0R7v_idJyYsJbm7_g7nAoQxpmHEwFnMkqXWjA7o9OiOjFFmPDF1_ghnrdEI7yqTDXvUxpsnptbMPVmRMhhPbQ',
};

const initiateAuth = async ({
  username,
  password,
  clientId,
  userPoolId,
  session,
}) => {
  const client = new CognitoIdentityProviderClient({
    region: 'us-east-1',
  });

  const command = new AdminRespondToAuthChallengeCommand({
    ChallengeName: ChallengeNameType.NEW_PASSWORD_REQUIRED,
    UserPoolId: userPoolId,
    ClientId: clientId,
    ChallengeResponses: {
      USERNAME: username,
      NEW_PASSWORD: password,
    },
    Session: session,
  });

  return client.send(command);
};

(async () => {
  const response = await initiateAuth(authenticationData);
  console.log(response);
})();
