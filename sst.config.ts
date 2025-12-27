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
    const isProduction = $app.stage === "production";
    const journalTable = new sst.aws.Dynamo("JournalTable", {
      fields: {
        userId: "string",
        entry: "string",
      },
      primaryIndex: { hashKey: "userId", rangeKey: "entry" },
    });
    const api = new sst.aws.ApiGatewayV2("Api", {
      domain: isProduction &&
        {
          name: "api.glorpcloud.tropicbliss.net",
          dns: sst.cloudflare.dns(),
        },
      transform: {
        route: {
          handler: {
            link: [journalTable],
            runtime: "go",
            architecture: "arm64",
            memory: "128 MB",
          },
          args: {
            auth: { iam: true },
          },
        api: {
          corsConfiguration: {
            allowCredentials: true,
            allowHeaders: [
              "authorization",
              "content-type",
              "x-amz-date",
              "X-amz-security-token",
            ],
            allowMethods: ["GET", "POST", "PUT", "DELETE"],
            allowOrigins: [
              isProduction
                ? "https://glorpcloud.tropicbliss.net"
                : "http://localhost:5173",
            ],
            maxAge: isProduction ? 86400 : 300,
          },
        },
      },
    });
    api.route("GET /journal" {
      handler: "./packages/functions",
    });
    api.route("POST /journal" {
      handler: "./packages/functions",
    });
    api.route("PUT /journal" {
      handler: "./packages/functions",
    });
    api.route("DELETE /journal" {
      handler: "./packages/functions",
    });
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
