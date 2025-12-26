package main

import (
	"context"
	"encoding/json"
	"os"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/feature/dynamodb/attributevalue"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb"
	"github.com/aws/aws-sdk-go-v2/service/dynamodb/types"
	"github.com/sst/sst/v3/sdk/golang/resource"
)

type DbInstance struct {
	Client    *dynamodb.Client
	TableName string
}

type App struct {
	Db DbInstance
}

func NewApp() App {
	return App{
		Db: getDynamoDb(),
	}
}

func getDynamoDb() DbInstance {
	cfg, err := config.LoadDefaultConfig(context.Background(), func(opts *config.LoadOptions) error {
		opts.Region = os.Getenv("AWS_REGION")
		return nil
	})
	if err != nil {
		panic(err)
	}
	client := dynamodb.NewFromConfig(cfg)
	tableName, err := resource.Get("JournalTable", "name")
	if err != nil {
		panic(err)
	}
	return DbInstance{
		Client:    client,
		TableName: tableName.(string),
	}
}

func getKey(userId string, date string) map[string]types.AttributeValue {
	key, err := attributevalue.MarshalMap(map[string]string{
		"userId": userId,
		"entry":  date,
	})
	if err != nil {
		panic(err)
	}
	return key
}

type JournalItem struct {
	UserId  string `dynamodbav:"userId"`
	Date    string `dynamodbav:"entry"`
	Content string `dynamodbav:"content"`
}

func updateFormatTo(content interface{}) map[string]types.AttributeValue {
	type UpdateJournalItem struct {
		Content string `dynamodbav:":content"`
	}

	rawContentBytes, err := json.Marshal(content)
	if err != nil {
		panic(err)
	}
	rawContent := string(rawContentBytes)
	item := UpdateJournalItem{
		Content: rawContent,
	}
	rawItem, err := attributevalue.MarshalMap(item)
	if err != nil {
		panic(err)
	}
	return rawItem
}

func formatFrom(rawItem map[string]types.AttributeValue) JournalItem {
	var item JournalItem
	err := attributevalue.UnmarshalMap(rawItem, &item)
	if err != nil {
		panic(err)
	}
	return item
}

func formatTo(item JournalItem) map[string]types.AttributeValue {
	rawItem, err := attributevalue.MarshalMap(item)
	if err != nil {
		panic(err)
	}
	return rawItem
}

func (app *App) getJournal(ctx context.Context, userId string, date string) interface{} {
	key := getKey(userId, date)
	output, err := app.Db.Client.GetItem(ctx, &dynamodb.GetItemInput{
		TableName: &app.Db.TableName,
		Key:       key,
	})
	if err != nil {
		panic(err)
	}
	if output.Item == nil {
		return nil
	}
	item := formatFrom(output.Item)
	var result interface{}
	err = json.Unmarshal([]byte(item.Content), &result)
	if err != nil {
		panic(err)
	}
	return result
}

func (app *App) deleteJournal(ctx context.Context, userId string, date string) {
	key := getKey(userId, date)
	_, err := app.Db.Client.DeleteItem(ctx, &dynamodb.DeleteItemInput{
		TableName: &app.Db.TableName,
		Key:       key,
	})
	if err != nil {
		panic(err)
	}
}

func (app *App) putJournal(ctx context.Context, userId string, date string, content interface{}) {
	key := getKey(userId, date)
	_, err := app.Db.Client.UpdateItem(ctx, &dynamodb.UpdateItemInput{
		TableName:                 &app.Db.TableName,
		Key:                       key,
		UpdateExpression:          aws.String("set content = :content"),
		ExpressionAttributeValues: updateFormatTo(content),
	})
	if err != nil {
		panic(err)
	}
}

func (app *App) postJournal(ctx context.Context, userId string, date string) {
	item := JournalItem{
		UserId:  userId,
		Date:    date,
		Content: `{"root":{"children":[{"children":[{"detail":0,"format":0,"mode":"normal","style":"","text":"","type":"text","version":1}],"direction":"ltr","format":"","indent":0,"type":"paragraph","version":1}],"direction":"ltr","format":"","indent":0,"type":"root","version":1}}`,
	}
	rawItem := formatTo(item)
	_, err := app.Db.Client.PutItem(ctx, &dynamodb.PutItemInput{
		TableName: &app.Db.TableName,
		Item:      rawItem,
	})
	if err != nil {
		panic(err)
	}
}
