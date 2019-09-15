'use strict';

import { auth } from '../../../dsconfig.json';

export const AUTH_HOST = 'http://localhost:7000';
export let AUTH;

let auth_mode = auth.type || 'seon-auth';

switch(auth_mode) {
  case 'seon-auth':
    AUTH = {
      mode: 'seon-auth',
      url: auth['url'],
      clientId: auth['clientId'],
      clientSecret: auth['clientSecret']
    };
    break;
  case 'solo':
    AUTH = {
      mode: 'solo',
      ownerId: auth['ownerId'],
      user: auth['user'],
      secret: auth['secret']
    };
    break;
}
