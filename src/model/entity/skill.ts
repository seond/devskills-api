import {Entity, ObjectIdColumn, ObjectID, Column, ManyToMany} from 'typeorm';

@Entity()
export class Skill {

    @ObjectIdColumn()
    id: ObjectID;

    @Column()
    name: string;
}
