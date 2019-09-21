'use strict'

import { Connection, ObjectID } from 'typeorm'

import { connection } from '../database';
import { AccessToken as Entity } from './entity/accesstoken';

export class AccessToken {
  accessToken: string;
  clientId: string;
  expires: Date;
  userId: string;
  dbObject: Entity;

  constructor() {
    this.dbObject = new Entity();
  }

  setPropertiesFromDbObject(dbObject: Entity) {
    this.dbObject = dbObject;
    if (dbObject.accessToken) {
      this.accessToken = dbObject.accessToken;
    }
    if (dbObject.clientId) {
      this.clientId = dbObject.clientId;
    }
    if (dbObject.expires) {
      this.expires = dbObject.expires;
    }
    if (dbObject.userId) {
      this.userId = dbObject.userId;
    }
  }

  save(): Promise<Object> {
    return connection.then((conn: Connection) => {
      this.dbObject.accessToken = this.accessToken;
      this.dbObject.clientId = this.clientId;
      this.dbObject.expires = this.expires;
      this.dbObject.userId = this.userId;
      return conn.manager.save(this.dbObject);
    });
  }
}

export function getOneByAccessToken(accessToken: string): Promise<AccessToken> {
  return connection
    .then((conn: Connection) => {
      return conn.manager.findOne(Entity, {
        accessToken
      });
    }).then((dbObject: Entity) => {
      if (!dbObject) {
        return;
      }
      let obj = new AccessToken();
      obj.setPropertiesFromDbObject(dbObject);
      return obj;
    });
}
