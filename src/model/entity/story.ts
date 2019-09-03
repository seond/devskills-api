import {Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';
import { cpus } from 'os';

@Entity()
export class Story {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    owner: string;

    @Column()
    sentence: string;
}
