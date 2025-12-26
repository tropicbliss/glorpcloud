package main

import (
	"context"
	"net/http"

	"github.com/aws/aws-lambda-go/events"
	"github.com/aws/aws-lambda-go/lambda"
	"github.com/awslabs/aws-lambda-go-api-proxy/httpadapter"
)

func router() *http.ServeMux {
	mux := http.NewServeMux()
	journalHandler := newJournalHandler()
	mux.HandleFunc("GET /journal/{date}", journalHandler.get)
	mux.HandleFunc("POST /journal", journalHandler.post)
	mux.HandleFunc("PUT /journal", journalHandler.put)
	mux.HandleFunc("DELETE /journal", journalHandler.delete)
	return mux
}

func main() {
	lambda.Start(func(ctx context.Context, event events.APIGatewayV2HTTPRequest) (events.APIGatewayV2HTTPResponse, error) {
		userId := event.RequestContext.Authorizer.IAM.CognitoIdentity.IdentityID
		ctx = context.WithValue(ctx, "userId", userId)
		adapter := httpadapter.NewV2(router())
		return adapter.ProxyWithContext(ctx, event)
	})
}
