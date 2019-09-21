import {Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity({ name: "oauth_accesstokens" })
export class AccessToken {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    accessToken: string;

    @Column()
    clientId: string;

    @Column()
    expires: Date;

    @Column()
    userId: string;
}
