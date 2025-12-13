import { APIGatewayProxyEvent, Context } from "aws-lambda";
import { ZodError } from "zod";

export namespace Util {
    export type Input = {
        body: object;
        userId: string;
    };

    export function handler(
        lambda: (
            input: Input,
        ) => object,
    ) {
        return async function (event: APIGatewayProxyEvent, _context: Context) {
            let body: object | undefined, statusCode: number;

            try {
                let request = {};
                if (event.body) {
                    request = { ...body, ...JSON.parse(event.body) };
                }
                if (event?.pathParameters) {
                    request = { ...body, ...event.pathParameters };
                }
                const rawReturn = await lambda({
                    body: request,
                    userId: event.requestContext.authorizer!.iam.cognitoIdentity
                        .identityId,
                });
                body = rawReturn;
                statusCode = 200;
            } catch (error) {
                statusCode = 400;
                if (error instanceof ZodError) {
                    const errors = error.errors.map((err) => ({
                        path: err.path.join("."),
                        message: err.message,
                    }));
                    body = {
                        error: errors,
                    };
                } else {
                    console.error(error);
                    statusCode = 500;
                    body = {
                        error: "Something went horribly wrong",
                    };
                }
            }
            console.log(body);
            return {
                body: body ? JSON.stringify(body) : "",
                statusCode,
                headers: {
                    "Access-Control-Allow-Origin": "*",
                    "Access-Control-Allow-Credentials": true,
                },
            };
        };
    }
}
