import { User } from "../entities/User";
import {
  Arg,
  Ctx,
  Field,
  InputType,
  Mutation,
  ObjectType,
  Query,
  Resolver,
} from "type-graphql";
import { MyContext } from "src/types";
import argon2 from "argon2";
import { v4 } from "uuid";
import { getConnection } from "typeorm";

@InputType()
class UsernamePasswordInput {
  @Field()
  username: string;

  @Field({ nullable: true })
  email: string;

  @Field()
  password: string;
}

@ObjectType()
export class FieldError {
  @Field()
  field: string;

  @Field()
  message: string;
}

@ObjectType()
class UserResponse {
  @Field(() => [FieldError], { nullable: true })
  errors?: [FieldError];

  @Field(() => User, { nullable: true })
  user?: User;

  @Field({ nullable: true })
  token?: string;
}

@Resolver()
export class UserResolver {
  @Query(() => User, { nullable: true })
  me(@Ctx() {}: MyContext) {
    // fetch from async store
  }

  @Query(() => [User])
  listusers() {
    return User.find();
  }

  @Mutation(() => UserResponse)
  async register(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() {}: MyContext
  ): Promise<UserResponse> {
    if (options.username.length <= 2) {
      return {
        errors: [
          { field: "username", message: "length must be greater than 2" },
        ],
      };
    }
    if (options.username.includes("@")) {
      return {
        errors: [
          { field: "username", message: "username cannot have symbol @" },
        ],
      };
    }
    if (options.password.length <= 3) {
      return {
        errors: [
          { field: "password", message: "length must be greater than 3" },
        ],
      };
    }
    if (!options.email || !options.email.includes("@")) {
      return {
        errors: [{ field: "email", message: "invalid email" }],
      };
    }
    const hashedpassword = await argon2.hash(options.password);
    let user;
    try {
      const result = await getConnection()
        .createQueryBuilder()
        .insert()
        .into(User)
        .values([
          {
            username: options.username,
            password: hashedpassword,
            email: options.email,
          },
        ])
        .execute();
      user = result.raw[0];
    } catch (err) {
      // duplicate name error
      if (err.code == "23505") {
        return {
          errors: [{ field: "username", message: "username already exists" }],
        };
      }
    }
    const token = v4();
    return { user, token };
  }

  @Mutation(() => UserResponse)
  async login(
    @Arg("options") options: UsernamePasswordInput,
    @Ctx() {}: MyContext
  ): Promise<UserResponse> {
    const user = await User.findOne({ where: { username: options.username } });
    if (!user) {
      return {
        errors: [{ field: "username", message: "username doesn't exist" }],
      };
    }
    const verify = await argon2.verify(user.password, options.password);
    if (verify) {
      const token = v4();
      return { user, token };
    } else {
      return {
        errors: [
          { field: "password", message: "Incorrect password or username" },
        ],
      };
    }
  }

  // @Mutation(() => Boolean)
  // logout(@Ctx() {}: MyContext) {
  //   return new Promise((resolve) => {
  //     // TODO: remove from asyncstore
  //     resolve(true);
  //   });
  // }
}
