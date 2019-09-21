import { AUTH } from '../../common/config';
import { authenticate as authenticateBearer } from './bearer';
import { authenticate as authenticateSolo } from './solo';

export let authenticate;

switch(AUTH.mode) {
  case 'seon-auth':
    authenticate = authenticateBearer;
    break;
  case 'solo':
    authenticate = authenticateSolo(AUTH);
    break;
}
