"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
require("reflect-metadata");
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const apollo_server_express_1 = require("apollo-server-express");
const type_graphql_1 = require("type-graphql");
const resolvers_1 = require("./resolvers");
const typeorm_1 = require("typeorm");
const User_1 = require("./entities/User");
const main = async () => {
    const conn = await (0, typeorm_1.createConnection)({
        type: "postgres",
        url: process.env.DATABASE_URL,
        logging: true,
        synchronize: true,
        extra: { rejectUnauthorized: false },
        entities: [User_1.User],
    });
    console.log("connected at", conn.name);
    const app = (0, express_1.default)();
    app.set("trust proxy", true);
    app.use((0, cors_1.default)());
    const apolloServer = new apollo_server_express_1.ApolloServer({
        introspection: true,
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [resolvers_1.UserResolver, resolvers_1.HelloResolver],
            validate: false,
        }),
        context: ({ req, res }) => ({
            req,
            res,
        }),
    });
    await apolloServer.start();
    apolloServer.applyMiddleware({
        app,
        cors: false,
    });
    app.listen({ port: process.env.PORT || 4000 }, () => {
        console.log("server started on localhost:4000");
    });
};
main();
//# sourceMappingURL=index.js.map