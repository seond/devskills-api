import {Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity()
export class Skill {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;
}
