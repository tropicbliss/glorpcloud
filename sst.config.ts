/// <reference path="./.sst/platform/config.d.ts" />
export default $config({
  app(input) {
    return {
      name: "glorpcloud",
      removal: input?.stage === "production" ? "retain" : "remove",
      protect: ["production"].includes(input?.stage),
      home: "aws",
      providers: {
        aws: {
          region: "ap-southeast-1",
        },
        cloudflare: "6.11.0",
      },
    };
  },
  async run() {
    const journalTable = new sst.aws.Dynamo("JournalTable", {
      fields: {
        userId: "string",
        entry: "string",
      },
      primaryIndex: { hashKey: "userId", rangeKey: "entry" },
    });
    const api = new sst.aws.ApiGatewayV2("Api", {
      domain: $app.stage === "production"
        ? {
          name: "api.glorpcloud.tropicbliss.net",
          dns: sst.cloudflare.dns(),
        }
        : undefined,
      transform: {
        route: {
          handler: {
            link: [journalTable],
            runtime: "nodejs22.x",
            architecture: "arm64",
          },
          args: {
            auth: { iam: true },
          },
        },
      },
    });
    api.route(
      "DELETE /journal",
      {
        handler: "packages/functions/src/journal/delete.main",
      },
    );
    api.route(
      "GET /journal/{date}",
      {
        handler: "packages/functions/src/journal/get.main",
      },
    );
    api.route(
      "POST /journal",
      {
        handler: "packages/functions/src/journal/post.main",
      },
    );
    api.route(
      "PUT /journal",
      {
        handler: "packages/functions/src/journal/put.main",
      },
    );
    const region = aws.getRegionOutput().name;
    const userPool = new sst.aws.CognitoUserPool("UserPool", {
      usernames: ["email"],
    });
    const userPoolClient = userPool.addClient("UserPoolClient");
    const identityPool = new sst.aws.CognitoIdentityPool("IdentityPool", {
      userPools: [
        {
          userPool: userPool.id,
          client: userPoolClient.id,
        },
      ],
      permissions: {
        authenticated: [
          {
            actions: ["execute-api:*"],
            resources: [
              $concat(
                "arn:aws:execute-api:",
                region,
                ":",
                aws.getCallerIdentityOutput({}).accountId,
                ":",
                api.nodes.api.id,
                "/*/*/*",
              ),
            ],
          },
        ],
      },
    });
    new sst.aws.StaticSite("Frontend", {
      path: "packages/frontend",
      build: {
        output: "dist",
        command: "npm run build",
      },
      domain: $app.stage === "production"
        ? {
          name: "glorpcloud.tropicbliss.net",
          dns: sst.cloudflare.dns(),
        }
        : undefined,
      environment: {
        VITE_REGION: region,
        VITE_API_URL: api.url,
        VITE_USER_POOL_ID: userPool.id,
        VITE_IDENTITY_POOL_ID: identityPool.id,
        VITE_USER_POOL_CLIENT_ID: userPoolClient.id,
      },
    });
    return {
      UserPool: userPool.id,
      Region: region,
      IdentityPool: identityPool.id,
      UserPoolClient: userPoolClient.id,
    };
  },
});
