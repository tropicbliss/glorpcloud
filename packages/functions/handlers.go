package main

import (
	"encoding/json"
	"fmt"
	"net/http"
	"time"
)

func respondWithJSON(w http.ResponseWriter, code int, payload interface{}) {
	encoder := json.NewEncoder(w)
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	encoder.Encode(payload)
}

func respondWithSuccess(w http.ResponseWriter) {
	w.WriteHeader(http.StatusOK)
}

func invalidJson(w http.ResponseWriter) {
	http.Error(w, "Invalid JSON", http.StatusBadRequest)
}

func extractUserId(r *http.Request) string {
	userId, ok := r.Context().Value("userId").(string)
	if !ok {
		panic("user id is somehow not provided by the api gateway")
	}
	return userId
}

func verifyDate(dateStr string) bool {
	_, err := time.Parse("2006-01-02", dateStr)
	return err == nil
}

type JournalPayload struct {
	UserId  string
	Date    string
	Content map[string]any
}

func getPayload(w http.ResponseWriter, r *http.Request) *JournalPayload {
	type JournalRequest struct {
		Date    string         `json:"date"`
		Content map[string]any `json:"content"`
	}

	userId := extractUserId(r)
	var req JournalRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		invalidJson(w)
		return nil
	}
	ok := verifyDate(req.Date)
	if !ok {
		invalidJson(w)
		return nil
	}
	return &JournalPayload{
		UserId:  userId,
		Date:    req.Date,
		Content: req.Content,
	}
}

type JournalHandler struct {
	App App
}

func newJournalHandler() JournalHandler {
	return JournalHandler{
		App: NewApp(),
	}
}

func (h *JournalHandler) get(w http.ResponseWriter, r *http.Request) {
	userId := extractUserId(r)
	fmt.Println("Hello")
	fmt.Println(userId)
	date := r.PathValue("date")
	isDateValid := verifyDate(date)
	if !isDateValid {
		invalidJson(w)
		return
	}
	respondWithJSON(w, http.StatusOK, map[string]interface{}{"content": h.App.getJournal(r.Context(), userId, date)})
}

func (h *JournalHandler) post(w http.ResponseWriter, r *http.Request) {
	data := getPayload(w, r)
	if data == nil {
		return
	}
	h.App.postJournal(r.Context(), data.UserId, data.Date)
	respondWithSuccess(w)
}

func (h *JournalHandler) put(w http.ResponseWriter, r *http.Request) {
	data := getPayload(w, r)
	if data == nil {
		return
	}
	if data.Content == nil {
		invalidJson(w)
		return
	}
	h.App.putJournal(r.Context(), data.UserId, data.Date, data.Content)
	respondWithSuccess(w)
}

func (h *JournalHandler) delete(w http.ResponseWriter, r *http.Request) {
	data := getPayload(w, r)
	if data == nil {
		return
	}
	h.App.deleteJournal(r.Context(), data.UserId, data.Date)
	respondWithSuccess(w)
}
