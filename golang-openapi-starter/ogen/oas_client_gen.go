// Code generated by ogen, DO NOT EDIT.

package main

import (
	"context"
	"net/url"
	"strings"
	"time"

	"github.com/go-faster/errors"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	semconv "go.opentelemetry.io/otel/semconv/v1.26.0"
	"go.opentelemetry.io/otel/trace"

	ht "github.com/ogen-go/ogen/http"
	"github.com/ogen-go/ogen/otelogen"
	"github.com/ogen-go/ogen/uri"
)

// Invoker invokes operations described by OpenAPI v3 specification.
type Invoker interface {
	// AudioInput invokes AudioInput operation.
	//
	// POST /call/AudioInput
	AudioInput(ctx context.Context, request *AudioInputReq) (string, error)
	// ChooseNTools invokes ChooseNTools operation.
	//
	// POST /call/ChooseNTools
	ChooseNTools(ctx context.Context, request *ChooseNToolsReq) ([]NilChooseNToolsResponseItem, error)
	// ChooseOneTool invokes ChooseOneTool operation.
	//
	// POST /call/ChooseOneTool
	ChooseOneTool(ctx context.Context, request *ChooseOneToolReq) (NilChooseOneToolOK, error)
	// ClassifyConversation invokes ClassifyConversation operation.
	//
	// POST /call/ClassifyConversation
	ClassifyConversation(ctx context.Context, request *ClassifyConversationReq) ([]Category, error)
	// ClassifyMessage invokes ClassifyMessage operation.
	//
	// POST /call/ClassifyMessage
	ClassifyMessage(ctx context.Context, request *ClassifyMessageReq) (Category, error)
	// ClassifyMessageUsingOllama invokes ClassifyMessageUsingOllama operation.
	//
	// POST /call/ClassifyMessageUsingOllama
	ClassifyMessageUsingOllama(ctx context.Context, request *ClassifyMessageUsingOllamaReq) (OCategory, error)
	// ClassifyMessageWithRoles invokes ClassifyMessageWithRoles operation.
	//
	// POST /call/ClassifyMessageWithRoles
	ClassifyMessageWithRoles(ctx context.Context, request *ClassifyMessageWithRolesReq) (MyCategory, error)
	// ClassifyMessageWithSymbol invokes ClassifyMessageWithSymbol operation.
	//
	// POST /call/ClassifyMessageWithSymbol
	ClassifyMessageWithSymbol(ctx context.Context, request *ClassifyMessageWithSymbolReq) (MyClass, error)
	// DescribeImage invokes DescribeImage operation.
	//
	// POST /call/DescribeImage
	DescribeImage(ctx context.Context, request *DescribeImageReq) (*ImageDescription, error)
	// ExtractReceipt invokes ExtractReceipt operation.
	//
	// POST /call/ExtractReceipt
	ExtractReceipt(ctx context.Context, request *ExtractReceiptReq) (*Receipt, error)
	// ExtractResume invokes ExtractResume operation.
	//
	// POST /call/ExtractResume
	ExtractResume(ctx context.Context, request *ExtractResumeReq) (*Resume, error)
	// ExtractResumeUsingOllama invokes ExtractResumeUsingOllama operation.
	//
	// POST /call/ExtractResumeUsingOllama
	ExtractResumeUsingOllama(ctx context.Context, request *ExtractResumeUsingOllamaReq) (*OResume, error)
	// FunctionWithConditionals invokes FunctionWithConditionals operation.
	//
	// POST /call/FunctionWithConditionals
	FunctionWithConditionals(ctx context.Context, request *FunctionWithConditionalsReq) (string, error)
	// FunctionWithLoops invokes FunctionWithLoops operation.
	//
	// POST /call/FunctionWithLoops
	FunctionWithLoops(ctx context.Context, request *FunctionWithLoopsReq) (string, error)
	// GetOrderInfo invokes GetOrderInfo operation.
	//
	// POST /call/GetOrderInfo
	GetOrderInfo(ctx context.Context, request *GetOrderInfoReq) (*OrderInfo, error)
	// UseTool invokes UseTool operation.
	//
	// POST /call/UseTool
	UseTool(ctx context.Context, request *UseToolReq) (*WeatherAPI, error)
}

// Client implements OAS client.
type Client struct {
	serverURL *url.URL
	baseClient
}

var _ Handler = struct {
	*Client
}{}

func trimTrailingSlashes(u *url.URL) {
	u.Path = strings.TrimRight(u.Path, "/")
	u.RawPath = strings.TrimRight(u.RawPath, "/")
}

// NewClient initializes new Client defined by OAS.
func NewClient(serverURL string, opts ...ClientOption) (*Client, error) {
	u, err := url.Parse(serverURL)
	if err != nil {
		return nil, err
	}
	trimTrailingSlashes(u)

	c, err := newClientConfig(opts...).baseClient()
	if err != nil {
		return nil, err
	}
	return &Client{
		serverURL:  u,
		baseClient: c,
	}, nil
}

type serverURLKey struct{}

// WithServerURL sets context key to override server URL.
func WithServerURL(ctx context.Context, u *url.URL) context.Context {
	return context.WithValue(ctx, serverURLKey{}, u)
}

func (c *Client) requestURL(ctx context.Context) *url.URL {
	u, ok := ctx.Value(serverURLKey{}).(*url.URL)
	if !ok {
		return c.serverURL
	}
	return u
}

// AudioInput invokes AudioInput operation.
//
// POST /call/AudioInput
func (c *Client) AudioInput(ctx context.Context, request *AudioInputReq) (string, error) {
	res, err := c.sendAudioInput(ctx, request)
	return res, err
}

func (c *Client) sendAudioInput(ctx context.Context, request *AudioInputReq) (res string, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("AudioInput"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/AudioInput"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "AudioInput",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/AudioInput"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeAudioInputRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeAudioInputResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ChooseNTools invokes ChooseNTools operation.
//
// POST /call/ChooseNTools
func (c *Client) ChooseNTools(ctx context.Context, request *ChooseNToolsReq) ([]NilChooseNToolsResponseItem, error) {
	res, err := c.sendChooseNTools(ctx, request)
	return res, err
}

func (c *Client) sendChooseNTools(ctx context.Context, request *ChooseNToolsReq) (res []NilChooseNToolsResponseItem, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ChooseNTools"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ChooseNTools"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ChooseNTools",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ChooseNTools"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeChooseNToolsRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeChooseNToolsResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ChooseOneTool invokes ChooseOneTool operation.
//
// POST /call/ChooseOneTool
func (c *Client) ChooseOneTool(ctx context.Context, request *ChooseOneToolReq) (NilChooseOneToolOK, error) {
	res, err := c.sendChooseOneTool(ctx, request)
	return res, err
}

func (c *Client) sendChooseOneTool(ctx context.Context, request *ChooseOneToolReq) (res NilChooseOneToolOK, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ChooseOneTool"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ChooseOneTool"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ChooseOneTool",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ChooseOneTool"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeChooseOneToolRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeChooseOneToolResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ClassifyConversation invokes ClassifyConversation operation.
//
// POST /call/ClassifyConversation
func (c *Client) ClassifyConversation(ctx context.Context, request *ClassifyConversationReq) ([]Category, error) {
	res, err := c.sendClassifyConversation(ctx, request)
	return res, err
}

func (c *Client) sendClassifyConversation(ctx context.Context, request *ClassifyConversationReq) (res []Category, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ClassifyConversation"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ClassifyConversation"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ClassifyConversation",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ClassifyConversation"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeClassifyConversationRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeClassifyConversationResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ClassifyMessage invokes ClassifyMessage operation.
//
// POST /call/ClassifyMessage
func (c *Client) ClassifyMessage(ctx context.Context, request *ClassifyMessageReq) (Category, error) {
	res, err := c.sendClassifyMessage(ctx, request)
	return res, err
}

func (c *Client) sendClassifyMessage(ctx context.Context, request *ClassifyMessageReq) (res Category, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ClassifyMessage"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ClassifyMessage"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ClassifyMessage",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ClassifyMessage"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeClassifyMessageRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeClassifyMessageResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ClassifyMessageUsingOllama invokes ClassifyMessageUsingOllama operation.
//
// POST /call/ClassifyMessageUsingOllama
func (c *Client) ClassifyMessageUsingOllama(ctx context.Context, request *ClassifyMessageUsingOllamaReq) (OCategory, error) {
	res, err := c.sendClassifyMessageUsingOllama(ctx, request)
	return res, err
}

func (c *Client) sendClassifyMessageUsingOllama(ctx context.Context, request *ClassifyMessageUsingOllamaReq) (res OCategory, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ClassifyMessageUsingOllama"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ClassifyMessageUsingOllama"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ClassifyMessageUsingOllama",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ClassifyMessageUsingOllama"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeClassifyMessageUsingOllamaRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeClassifyMessageUsingOllamaResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ClassifyMessageWithRoles invokes ClassifyMessageWithRoles operation.
//
// POST /call/ClassifyMessageWithRoles
func (c *Client) ClassifyMessageWithRoles(ctx context.Context, request *ClassifyMessageWithRolesReq) (MyCategory, error) {
	res, err := c.sendClassifyMessageWithRoles(ctx, request)
	return res, err
}

func (c *Client) sendClassifyMessageWithRoles(ctx context.Context, request *ClassifyMessageWithRolesReq) (res MyCategory, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ClassifyMessageWithRoles"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ClassifyMessageWithRoles"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ClassifyMessageWithRoles",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ClassifyMessageWithRoles"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeClassifyMessageWithRolesRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeClassifyMessageWithRolesResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ClassifyMessageWithSymbol invokes ClassifyMessageWithSymbol operation.
//
// POST /call/ClassifyMessageWithSymbol
func (c *Client) ClassifyMessageWithSymbol(ctx context.Context, request *ClassifyMessageWithSymbolReq) (MyClass, error) {
	res, err := c.sendClassifyMessageWithSymbol(ctx, request)
	return res, err
}

func (c *Client) sendClassifyMessageWithSymbol(ctx context.Context, request *ClassifyMessageWithSymbolReq) (res MyClass, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ClassifyMessageWithSymbol"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ClassifyMessageWithSymbol"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ClassifyMessageWithSymbol",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ClassifyMessageWithSymbol"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeClassifyMessageWithSymbolRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeClassifyMessageWithSymbolResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// DescribeImage invokes DescribeImage operation.
//
// POST /call/DescribeImage
func (c *Client) DescribeImage(ctx context.Context, request *DescribeImageReq) (*ImageDescription, error) {
	res, err := c.sendDescribeImage(ctx, request)
	return res, err
}

func (c *Client) sendDescribeImage(ctx context.Context, request *DescribeImageReq) (res *ImageDescription, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("DescribeImage"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/DescribeImage"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "DescribeImage",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/DescribeImage"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeDescribeImageRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeDescribeImageResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ExtractReceipt invokes ExtractReceipt operation.
//
// POST /call/ExtractReceipt
func (c *Client) ExtractReceipt(ctx context.Context, request *ExtractReceiptReq) (*Receipt, error) {
	res, err := c.sendExtractReceipt(ctx, request)
	return res, err
}

func (c *Client) sendExtractReceipt(ctx context.Context, request *ExtractReceiptReq) (res *Receipt, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ExtractReceipt"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ExtractReceipt"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ExtractReceipt",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ExtractReceipt"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeExtractReceiptRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeExtractReceiptResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ExtractResume invokes ExtractResume operation.
//
// POST /call/ExtractResume
func (c *Client) ExtractResume(ctx context.Context, request *ExtractResumeReq) (*Resume, error) {
	res, err := c.sendExtractResume(ctx, request)
	return res, err
}

func (c *Client) sendExtractResume(ctx context.Context, request *ExtractResumeReq) (res *Resume, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ExtractResume"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ExtractResume"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ExtractResume",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ExtractResume"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeExtractResumeRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeExtractResumeResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// ExtractResumeUsingOllama invokes ExtractResumeUsingOllama operation.
//
// POST /call/ExtractResumeUsingOllama
func (c *Client) ExtractResumeUsingOllama(ctx context.Context, request *ExtractResumeUsingOllamaReq) (*OResume, error) {
	res, err := c.sendExtractResumeUsingOllama(ctx, request)
	return res, err
}

func (c *Client) sendExtractResumeUsingOllama(ctx context.Context, request *ExtractResumeUsingOllamaReq) (res *OResume, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("ExtractResumeUsingOllama"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/ExtractResumeUsingOllama"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "ExtractResumeUsingOllama",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/ExtractResumeUsingOllama"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeExtractResumeUsingOllamaRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeExtractResumeUsingOllamaResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// FunctionWithConditionals invokes FunctionWithConditionals operation.
//
// POST /call/FunctionWithConditionals
func (c *Client) FunctionWithConditionals(ctx context.Context, request *FunctionWithConditionalsReq) (string, error) {
	res, err := c.sendFunctionWithConditionals(ctx, request)
	return res, err
}

func (c *Client) sendFunctionWithConditionals(ctx context.Context, request *FunctionWithConditionalsReq) (res string, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("FunctionWithConditionals"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/FunctionWithConditionals"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "FunctionWithConditionals",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/FunctionWithConditionals"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeFunctionWithConditionalsRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeFunctionWithConditionalsResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// FunctionWithLoops invokes FunctionWithLoops operation.
//
// POST /call/FunctionWithLoops
func (c *Client) FunctionWithLoops(ctx context.Context, request *FunctionWithLoopsReq) (string, error) {
	res, err := c.sendFunctionWithLoops(ctx, request)
	return res, err
}

func (c *Client) sendFunctionWithLoops(ctx context.Context, request *FunctionWithLoopsReq) (res string, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("FunctionWithLoops"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/FunctionWithLoops"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "FunctionWithLoops",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/FunctionWithLoops"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeFunctionWithLoopsRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeFunctionWithLoopsResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// GetOrderInfo invokes GetOrderInfo operation.
//
// POST /call/GetOrderInfo
func (c *Client) GetOrderInfo(ctx context.Context, request *GetOrderInfoReq) (*OrderInfo, error) {
	res, err := c.sendGetOrderInfo(ctx, request)
	return res, err
}

func (c *Client) sendGetOrderInfo(ctx context.Context, request *GetOrderInfoReq) (res *OrderInfo, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("GetOrderInfo"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/GetOrderInfo"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "GetOrderInfo",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/GetOrderInfo"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeGetOrderInfoRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeGetOrderInfoResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}

// UseTool invokes UseTool operation.
//
// POST /call/UseTool
func (c *Client) UseTool(ctx context.Context, request *UseToolReq) (*WeatherAPI, error) {
	res, err := c.sendUseTool(ctx, request)
	return res, err
}

func (c *Client) sendUseTool(ctx context.Context, request *UseToolReq) (res *WeatherAPI, err error) {
	otelAttrs := []attribute.KeyValue{
		otelogen.OperationID("UseTool"),
		semconv.HTTPRequestMethodKey.String("POST"),
		semconv.HTTPRouteKey.String("/call/UseTool"),
	}

	// Run stopwatch.
	startTime := time.Now()
	defer func() {
		// Use floating point division here for higher precision (instead of Millisecond method).
		elapsedDuration := time.Since(startTime)
		c.duration.Record(ctx, float64(float64(elapsedDuration)/float64(time.Millisecond)), metric.WithAttributes(otelAttrs...))
	}()

	// Increment request counter.
	c.requests.Add(ctx, 1, metric.WithAttributes(otelAttrs...))

	// Start a span for this request.
	ctx, span := c.cfg.Tracer.Start(ctx, "UseTool",
		trace.WithAttributes(otelAttrs...),
		clientSpanKind,
	)
	// Track stage for error reporting.
	var stage string
	defer func() {
		if err != nil {
			span.RecordError(err)
			span.SetStatus(codes.Error, stage)
			c.errors.Add(ctx, 1, metric.WithAttributes(otelAttrs...))
		}
		span.End()
	}()

	stage = "BuildURL"
	u := uri.Clone(c.requestURL(ctx))
	var pathParts [1]string
	pathParts[0] = "/call/UseTool"
	uri.AddPathParts(u, pathParts[:]...)

	stage = "EncodeRequest"
	r, err := ht.NewRequest(ctx, "POST", u)
	if err != nil {
		return res, errors.Wrap(err, "create request")
	}
	if err := encodeUseToolRequest(request, r); err != nil {
		return res, errors.Wrap(err, "encode request")
	}

	stage = "SendRequest"
	resp, err := c.cfg.Client.Do(r)
	if err != nil {
		return res, errors.Wrap(err, "do request")
	}
	defer resp.Body.Close()

	stage = "DecodeResponse"
	result, err := decodeUseToolResponse(resp)
	if err != nil {
		return res, errors.Wrap(err, "decode response")
	}

	return result, nil
}
