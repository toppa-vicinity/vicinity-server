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
const user_1 = require("./resolvers/user");
const hello_1 = require("./resolvers/hello");
const mysql_1 = require("mysql");
const main = async () => {
    await (0, mysql_1.createPool)({
        host: "toppa-vicinity-dev.cnxtjh97j1g2.us-east-1.rds.amazonaws.com",
        port: 3306,
        user: "vicinity_dev",
        password: "toppa_vicinity_dev6",
    });
    const app = (0, express_1.default)();
    app.set("trust proxy", true);
    app.use((0, cors_1.default)());
    const apolloServer = new apollo_server_express_1.ApolloServer({
        schema: await (0, type_graphql_1.buildSchema)({
            resolvers: [user_1.UserResolver, hello_1.HelloResolver],
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