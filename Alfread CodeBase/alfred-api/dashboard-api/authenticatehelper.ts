import {
  AuthFlowType,
  CognitoIdentityProviderClient,
  InitiateAuthCommand,
} from '@aws-sdk/client-cognito-identity-provider';

const authenticationData = {
  username: 'admin@getalfred.com',
  password: 'Admin@GetAlfred008()',
  clientId: '60spci00l36e0b9ouq7ojch0iu',
};

const initiateAuth = async ({ username, password, clientId }) => {
  const client = new CognitoIdentityProviderClient({
    region: 'us-east-1',
  });

  const command = new InitiateAuthCommand({
    AuthFlow: AuthFlowType.USER_PASSWORD_AUTH,
    AuthParameters: {
      USERNAME: username,
      PASSWORD: password,
    },
    ClientId: clientId,
  });

  return client.send(command);
};

(async () => {
  const response = await initiateAuth(authenticationData);
  console.log(response);
})();
