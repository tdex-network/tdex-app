/* eslint-disable */
// @generated by protobuf-ts 2.8.2 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v2/swap.proto" (package "tdex.v2", syntax proto3)
// tslint:disable
// @ts-nocheck
import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { UnblindedInput } from "./types_pb";
// @generated message type with reflection information, may provide speed optimized methods
class SwapRequest$Type extends MessageType {
    constructor() {
        super("tdex.v2.SwapRequest", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "amount_p", kind: "scalar", T: 4 /*ScalarType.UINT64*/ },
            { no: 3, name: "asset_p", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "amount_r", kind: "scalar", T: 4 /*ScalarType.UINT64*/ },
            { no: 5, name: "asset_r", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 6, name: "transaction", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 7, name: "fee_amount", kind: "scalar", T: 4 /*ScalarType.UINT64*/ },
            { no: 8, name: "fee_asset", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 9, name: "unblinded_inputs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => UnblindedInput }
        ]);
    }
    create(value) {
        const message = { id: "", amountP: "0", assetP: "", amountR: "0", assetR: "", transaction: "", feeAmount: "0", feeAsset: "", unblindedInputs: [] };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* uint64 amount_p = 2 [jstype = JS_STRING];*/ 2:
                    message.amountP = reader.uint64().toString();
                    break;
                case /* string asset_p */ 3:
                    message.assetP = reader.string();
                    break;
                case /* uint64 amount_r = 4 [jstype = JS_STRING];*/ 4:
                    message.amountR = reader.uint64().toString();
                    break;
                case /* string asset_r */ 5:
                    message.assetR = reader.string();
                    break;
                case /* string transaction */ 6:
                    message.transaction = reader.string();
                    break;
                case /* uint64 fee_amount = 7 [jstype = JS_STRING];*/ 7:
                    message.feeAmount = reader.uint64().toString();
                    break;
                case /* string fee_asset */ 8:
                    message.feeAsset = reader.string();
                    break;
                case /* repeated tdex.v2.UnblindedInput unblinded_inputs */ 9:
                    message.unblindedInputs.push(UnblindedInput.internalBinaryRead(reader, reader.uint32(), options));
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* uint64 amount_p = 2 [jstype = JS_STRING]; */
        if (message.amountP !== "0")
            writer.tag(2, WireType.Varint).uint64(message.amountP);
        /* string asset_p = 3; */
        if (message.assetP !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.assetP);
        /* uint64 amount_r = 4 [jstype = JS_STRING]; */
        if (message.amountR !== "0")
            writer.tag(4, WireType.Varint).uint64(message.amountR);
        /* string asset_r = 5; */
        if (message.assetR !== "")
            writer.tag(5, WireType.LengthDelimited).string(message.assetR);
        /* string transaction = 6; */
        if (message.transaction !== "")
            writer.tag(6, WireType.LengthDelimited).string(message.transaction);
        /* uint64 fee_amount = 7 [jstype = JS_STRING]; */
        if (message.feeAmount !== "0")
            writer.tag(7, WireType.Varint).uint64(message.feeAmount);
        /* string fee_asset = 8; */
        if (message.feeAsset !== "")
            writer.tag(8, WireType.LengthDelimited).string(message.feeAsset);
        /* repeated tdex.v2.UnblindedInput unblinded_inputs = 9; */
        for (let i = 0; i < message.unblindedInputs.length; i++)
            UnblindedInput.internalBinaryWrite(message.unblindedInputs[i], writer.tag(9, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapRequest
 */
export const SwapRequest = new SwapRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SwapAccept$Type extends MessageType {
    constructor() {
        super("tdex.v2.SwapAccept", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "request_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "transaction", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 4, name: "unblinded_inputs", kind: "message", repeat: 1 /*RepeatType.PACKED*/, T: () => UnblindedInput }
        ]);
    }
    create(value) {
        const message = { id: "", requestId: "", transaction: "", unblindedInputs: [] };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string request_id */ 2:
                    message.requestId = reader.string();
                    break;
                case /* string transaction */ 3:
                    message.transaction = reader.string();
                    break;
                case /* repeated tdex.v2.UnblindedInput unblinded_inputs */ 4:
                    message.unblindedInputs.push(UnblindedInput.internalBinaryRead(reader, reader.uint32(), options));
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string request_id = 2; */
        if (message.requestId !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.requestId);
        /* string transaction = 3; */
        if (message.transaction !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.transaction);
        /* repeated tdex.v2.UnblindedInput unblinded_inputs = 4; */
        for (let i = 0; i < message.unblindedInputs.length; i++)
            UnblindedInput.internalBinaryWrite(message.unblindedInputs[i], writer.tag(4, WireType.LengthDelimited).fork(), options).join();
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapAccept
 */
export const SwapAccept = new SwapAccept$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SwapComplete$Type extends MessageType {
    constructor() {
        super("tdex.v2.SwapComplete", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "accept_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "transaction", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", acceptId: "", transaction: "" };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string accept_id */ 2:
                    message.acceptId = reader.string();
                    break;
                case /* string transaction */ 3:
                    message.transaction = reader.string();
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string accept_id = 2; */
        if (message.acceptId !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.acceptId);
        /* string transaction = 3; */
        if (message.transaction !== "")
            writer.tag(3, WireType.LengthDelimited).string(message.transaction);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapComplete
 */
export const SwapComplete = new SwapComplete$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SwapFail$Type extends MessageType {
    constructor() {
        super("tdex.v2.SwapFail", [
            { no: 1, name: "id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 2, name: "message_id", kind: "scalar", T: 9 /*ScalarType.STRING*/ },
            { no: 3, name: "failure_code", kind: "scalar", T: 13 /*ScalarType.UINT32*/ },
            { no: 4, name: "failure_message", kind: "scalar", T: 9 /*ScalarType.STRING*/ }
        ]);
    }
    create(value) {
        const message = { id: "", messageId: "", failureCode: 0, failureMessage: "" };
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
                case /* string id */ 1:
                    message.id = reader.string();
                    break;
                case /* string message_id */ 2:
                    message.messageId = reader.string();
                    break;
                case /* uint32 failure_code */ 3:
                    message.failureCode = reader.uint32();
                    break;
                case /* string failure_message */ 4:
                    message.failureMessage = reader.string();
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
        /* string id = 1; */
        if (message.id !== "")
            writer.tag(1, WireType.LengthDelimited).string(message.id);
        /* string message_id = 2; */
        if (message.messageId !== "")
            writer.tag(2, WireType.LengthDelimited).string(message.messageId);
        /* uint32 failure_code = 3; */
        if (message.failureCode !== 0)
            writer.tag(3, WireType.Varint).uint32(message.failureCode);
        /* string failure_message = 4; */
        if (message.failureMessage !== "")
            writer.tag(4, WireType.LengthDelimited).string(message.failureMessage);
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapFail
 */
export const SwapFail = new SwapFail$Type();
