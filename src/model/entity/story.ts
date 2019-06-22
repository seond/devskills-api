import {Entity, ObjectIdColumn, ObjectID, Column, ManyToMany, JoinTable} from 'typeorm';

@Entity()
export class Story {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    sentence: string;
}
