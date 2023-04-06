/* eslint-disable */
// @generated by protobuf-ts 2.8.2 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v2/types.proto" (package "tdex.v2", syntax proto3)
// tslint:disable
// @ts-nocheck
import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
/**
 * @generated from protobuf enum tdex.v2.TradeType
 */
export var TradeType;
(function (TradeType) {
    /**
     * @generated from protobuf enum value: TRADE_TYPE_BUY = 0;
     */
    TradeType[TradeType["BUY"] = 0] = "BUY";
    /**
     * @generated from protobuf enum value: TRADE_TYPE_SELL = 1;
     */
    TradeType[TradeType["SELL"] = 1] = "SELL";
})(TradeType || (TradeType = {}));
/**
 * @generated from protobuf enum tdex.v2.ContentType
 */
export var ContentType;
(function (ContentType) {
    /**
     * @generated from protobuf enum value: CONTENT_TYPE_JSON = 0;
     */
    ContentType[ContentType["JSON"] = 0] = "JSON";
    /**
     * @generated from protobuf enum value: CONTENT_TYPE_GRPC = 1;
     */
    ContentType[ContentType["GRPC"] = 1] = "GRPC";
    /**
     * @generated from protobuf enum value: CONTENT_TYPE_GRPCWEB = 2;
     */
    ContentType[ContentType["GRPCWEB"] = 2] = "GRPCWEB";
    /**
     * @generated from protobuf enum value: CONTENT_TYPE_GRPCWEBTEXT = 3;
     */
    ContentType[ContentType["GRPCWEBTEXT"] = 3] = "GRPCWEBTEXT";
})(ContentType || (ContentType = {}));
// @generated message type with reflection information, may provide speed optimized methods
class UnblindedInput$Type extends MessageType {
    constructor() {
        super("tdex.v2.UnblindedInput", [
            { no: 1, name: "index", kind: "scalar", T: 13 /*ScalarType.UINT32*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "asset", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 3, name: "amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 4, name: "asset_blinder", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 5, name: "amount_blinder", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { index: 0, asset: "", amount: "0", assetBlinder: "", amountBlinder: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint32 index */ 1:
                    message.index = reader.uint32();
                    break;
                case /* string asset */ 2:
                    message.asset = reader.string();
                    break;
                case /* uint64 amount = 3 [jstype = JS_STRING];*/ 3:
                    message.amount = reader.uint64().toString();
                    break;
                case /* string asset_blinder */ 4:
                    message.assetBlinder = reader.string();
                    break;
                case /* string amount_blinder */ 5:
                    message.amountBlinder = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* uint32 index = 1; */
        if (message.index !== 0)
            writer.tag(1, WireType.Varint).uint32(message.index);
        /* string asset = 2; */
        if (message.asset !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.asset);
        /* uint64 amount = 3 [jstype = JS_STRING]; */
        if (message.amount !== "0")
            writer.tag(3, WireType.Varint).uint64(message.amount);
        /* string asset_blinder = 4; */
        if (message.assetBlinder !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.assetBlinder);
        /* string amount_blinder = 5; */
        if (message.amountBlinder !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.amountBlinder);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.UnblindedInput
 */
export const UnblindedInput = new UnblindedInput$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Fee$Type extends MessageType {
    constructor() {
        super("tdex.v2.Fee", [
            { no: 1, name: "percentage_fee", kind: "message", T: () => MarketFee, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "fixed_fee", kind: "message", T: () => MarketFee, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* tdex.v2.MarketFee percentage_fee */ 1:
                    message.percentageFee = MarketFee.internalBinaryRead(reader, reader.uint32(), options, message.percentageFee);
                    break;
                case /* tdex.v2.MarketFee fixed_fee */ 2:
                    message.fixedFee = MarketFee.internalBinaryRead(reader, reader.uint32(), options, message.fixedFee);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* tdex.v2.MarketFee percentage_fee = 1; */
        if (message.percentageFee)
            MarketFee.internalBinaryWrite(message.percentageFee, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* tdex.v2.MarketFee fixed_fee = 2; */
        if (message.fixedFee)
            MarketFee.internalBinaryWrite(message.fixedFee, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.Fee
 */
export const Fee = new Fee$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MarketFee$Type extends MessageType {
    constructor() {
        super("tdex.v2.MarketFee", [
            { no: 1, name: "base_asset", kind: "scalar", T: 3 /*ScalarType.INT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "quote_asset", kind: "scalar", T: 3 /*ScalarType.INT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { baseAsset: "0", quoteAsset: "0" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* int64 base_asset = 1 [jstype = JS_STRING];*/ 1:
                    message.baseAsset = reader.int64().toString();
                    break;
                case /* int64 quote_asset = 2 [jstype = JS_STRING];*/ 2:
                    message.quoteAsset = reader.int64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* int64 base_asset = 1 [jstype = JS_STRING]; */
        if (message.baseAsset !== "0")
            writer.tag(1, WireType.Varint).int64(message.baseAsset);
        /* int64 quote_asset = 2 [jstype = JS_STRING]; */
        if (message.quoteAsset !== "0")
            writer.tag(2, WireType.Varint).int64(message.quoteAsset);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.MarketFee
 */
export const MarketFee = new MarketFee$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Balance$Type extends MessageType {
    constructor() {
        super("tdex.v2.Balance", [
            { no: 1, name: "base_amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "quote_amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { baseAmount: "0", quoteAmount: "0" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* uint64 base_amount = 1 [jstype = JS_STRING];*/ 1:
                    message.baseAmount = reader.uint64().toString();
                    break;
                case /* uint64 quote_amount = 2 [jstype = JS_STRING];*/ 2:
                    message.quoteAmount = reader.uint64().toString();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* uint64 base_amount = 1 [jstype = JS_STRING]; */
        if (message.baseAmount !== "0")
            writer.tag(1, WireType.Varint).uint64(message.baseAmount);
        /* uint64 quote_amount = 2 [jstype = JS_STRING]; */
        if (message.quoteAmount !== "0")
            writer.tag(2, WireType.Varint).uint64(message.quoteAmount);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.Balance
 */
export const Balance = new Balance$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Market$Type extends MessageType {
    constructor() {
        super("tdex.v2.Market", [
            { no: 1, name: "base_asset", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "quote_asset", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { baseAsset: "", quoteAsset: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* string base_asset */ 1:
                    message.baseAsset = reader.string();
                    break;
                case /* string quote_asset */ 2:
                    message.quoteAsset = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* string base_asset = 1; */
        if (message.baseAsset !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.baseAsset);
        /* string quote_asset = 2; */
        if (message.quoteAsset !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.quoteAsset);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.Market
 */
export const Market = new Market$Type();
// @generated message type with reflection information, may provide speed optimized methods
class MarketWithFee$Type extends MessageType {
    constructor() {
        super("tdex.v2.MarketWithFee", [
            { no: 1, name: "market", kind: "message", T: () => Market, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "fee", kind: "message", T: () => Fee, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* tdex.v2.Market market */ 1:
                    message.market = Market.internalBinaryRead(reader, reader.uint32(), options, message.market);
                    break;
                case /* tdex.v2.Fee fee */ 2:
                    message.fee = Fee.internalBinaryRead(reader, reader.uint32(), options, message.fee);
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* tdex.v2.Market market = 1; */
        if (message.market)
            Market.internalBinaryWrite(message.market, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* tdex.v2.Fee fee = 2; */
        if (message.fee)
            Fee.internalBinaryWrite(message.fee, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.MarketWithFee
 */
export const MarketWithFee = new MarketWithFee$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Price$Type extends MessageType {
    constructor() {
        super("tdex.v2.Price", [
            { no: 1, name: "base_price", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "quote_price", kind: "scalar", T: 1 /*ScalarType.DOUBLE*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { basePrice: 0, quotePrice: 0 };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* double base_price */ 1:
                    message.basePrice = reader.double();
                    break;
                case /* double quote_price */ 2:
                    message.quotePrice = reader.double();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* double base_price = 1; */
        if (message.basePrice !== 0)
            writer.tag(1, WireType.Bit64).double(message.basePrice);
        /* double quote_price = 2; */
        if (message.quotePrice !== 0)
            writer.tag(2, WireType.Bit64).double(message.quotePrice);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.Price
 */
export const Price = new Price$Type();
// @generated message type with reflection information, may provide speed optimized methods
class Preview$Type extends MessageType {
    constructor() {
        super("tdex.v2.Preview", [
            { no: 1, name: "price", kind: "message", T: () => Price, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 2, name: "fee", kind: "message", T: () => Fee, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 3, name: "amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 4, name: "asset", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 5, name: "fee_amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/, options: { "google.api.field_behavior": ["REQUIRED"] } },
            { no: 6, name: "fee_asset", kind: "scalar", T: 9 /*ScalarType.STRING*/, options: { "google.api.field_behavior": ["REQUIRED"] } }
        ]);
    }
    create(value) {
        const message = { amount: "0", asset: "", feeAmount: "0", feeAsset: "" };
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        let message = target ?? this.create(), end = reader.pos + length;
        while (reader.pos < end) {
            let [fieldNo, wireType] = reader.tag();
            switch (fieldNo) {
                case /* tdex.v2.Price price */ 1:
                    message.price = Price.internalBinaryRead(reader, reader.uint32(), options, message.price);
                    break;
                case /* tdex.v2.Fee fee */ 2:
                    message.fee = Fee.internalBinaryRead(reader, reader.uint32(), options, message.fee);
                    break;
                case /* uint64 amount = 3 [jstype = JS_STRING];*/ 3:
                    message.amount = reader.uint64().toString();
                    break;
                case /* string asset */ 4:
                    message.asset = reader.string();
                    break;
                case /* uint64 fee_amount = 5 [jstype = JS_STRING];*/ 5:
                    message.feeAmount = reader.uint64().toString();
                    break;
                case /* string fee_asset */ 6:
                    message.feeAsset = reader.string();
                    break;
                default:
                    let u = options.readUnknownField;
                    if (u === "throw")
                        throw new globalThis.Error(`Unknown field ${fieldNo} (wire type ${wireType}) for ${this.typeName}`);
                    let d = reader.skip(wireType);
                    if (u !== false)
                        (u === true ? UnknownFieldHandler.onRead : u)(this.typeName, message, fieldNo, wireType, d);
            }
        }
        return message;
    }
    internalBinaryWrite(message, writer, options) {
        /* tdex.v2.Price price = 1; */
        if (message.price)
            Price.internalBinaryWrite(message.price, writer.tag(1, WireType.LengthDelimited).fork(), options).join();
        /* tdex.v2.Fee fee = 2; */
        if (message.fee)
            Fee.internalBinaryWrite(message.fee, writer.tag(2, WireType.LengthDelimited).fork(), options).join();
        /* uint64 amount = 3 [jstype = JS_STRING]; */
        if (message.amount !== "0")
            writer.tag(3, WireType.Varint).uint64(message.amount);
        /* string asset = 4; */
        if (message.asset !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.asset);
        /* uint64 fee_amount = 5 [jstype = JS_STRING]; */
        if (message.feeAmount !== "0")
            writer.tag(5, WireType.Varint).uint64(message.feeAmount);
        /* string fee_asset = 6; */
        if (message.feeAsset !== "")
            writer.tag(6, WireType.LengthDelimited).string(message.feeAsset);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.Preview
 */
export const Preview = new Preview$Type();
