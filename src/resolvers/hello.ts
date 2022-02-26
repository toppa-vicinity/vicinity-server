import { Query, Resolver } from "type-graphql";

@Resolver()
export class HelloResolver {
  @Query(() => String, { nullable: true })
  hello() {
    return "Hello world";
  }
}
