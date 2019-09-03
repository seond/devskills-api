import * as passport from 'passport';
import { Strategy } from 'passport-http-bearer';

import { AccessToken, getOneByAccessToken } from '../model/accesstoken';

const strategy = new Strategy((token, done) => {
  // to return a user instead of a token
  getOneByAccessToken(token).then((accessToken: AccessToken) => {
    if (!accessToken || isExpired(accessToken)) {
      done(null, null);
    }

    return {
      clientId: accessToken.clientId,
      userId: accessToken.userId
    };
  }).then((tokenData) => {
    done(null, tokenData);
  }).catch((err) => {
    done(err, false);
  });
});

passport.use(strategy);

export const authenticate = passport.authenticate('bearer', { session: false });

const isExpired = (token: AccessToken) => {
  const expiresAt = new Date(token.expires);

  if (expiresAt < new Date()) {
    return true;
  }

  return false;
};
