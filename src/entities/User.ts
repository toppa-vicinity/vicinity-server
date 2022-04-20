import { Field, ObjectType } from "type-graphql";
import {
  BaseEntity,
  Column,
  CreateDateColumn,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from "typeorm";
import { Entity } from "typeorm/decorator/entity/Entity";
import { ChatRoom } from "./ChatRoom";

@ObjectType()
@Entity()
export class User extends BaseEntity {
  @Field() // added to expose the field, which other wise we cannot query
  @PrimaryGeneratedColumn()
  id!: number;

  @Field()
  @Column({ unique: true })
  username!: string;

  @Column()
  password!: string;

  @Field()
  @Column({ unique: true })
  email!: string;

  @Field(() => [User], { nullable: true })
  @ManyToMany(() => User)
  @JoinTable()
  contacts: User[];

  @Field(() => [ChatRoom])
  @ManyToMany(() => ChatRoom)
  @JoinTable()
  chats!: ChatRoom[];

  @Field(() => String)
  @CreateDateColumn()
  createdAt: Date;

  @Field(() => String)
  @UpdateDateColumn()
  updatedAt: Date;
}
