import {Entity, ObjectIdColumn, ObjectID, Column } from 'typeorm';

@Entity()
export class Story {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    owner: string;

    @Column()
    chapterId: string;

    @Column()
    sentence: string;
}
