/* eslint-disable */
// @generated by protobuf-ts 2.8.2 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v1/transport.proto" (package "tdex.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
/* eslint-disable */
// @generated by protobuf-ts 2.8.2 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v1/transport.proto" (package "tdex.v1", syntax proto3)
// tslint:disable
// @ts-nocheck
import { ServiceType } from "@protobuf-ts/runtime-rpc";
import { WireType } from "@protobuf-ts/runtime";
import { UnknownFieldHandler } from "@protobuf-ts/runtime";
import { reflectionMergePartial } from "@protobuf-ts/runtime";
import { MESSAGE_TYPE } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { ContentType } from "./types_pb";
// @generated message type with reflection information, may provide speed optimized methods
class SupportedContentTypesRequest$Type extends MessageType {
    constructor() {
        super("tdex.v1.SupportedContentTypesRequest", []);
    }
    create(value) {
        const message = {};
        globalThis.Object.defineProperty(message, MESSAGE_TYPE, { enumerable: false, value: this });
        if (value !== undefined)
            reflectionMergePartial(this, message, value);
        return message;
    }
    internalBinaryRead(reader, length, options, target) {
        return target ?? this.create();
    }
    internalBinaryWrite(message, writer, options) {
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v1.SupportedContentTypesRequest
 */
export const SupportedContentTypesRequest = new SupportedContentTypesRequest$Type();
// @generated message type with reflection information, may provide speed optimized methods
class SupportedContentTypesResponse$Type extends MessageType {
    constructor() {
        super("tdex.v1.SupportedContentTypesResponse", [
            { no: 1, name: "accepted_types", kind: "enum", repeat: 1 /*RepeatType.PACKED*/, T: () => ["tdex.v1.ContentType", ContentType, "CONTENT_TYPE_"] }
        ]);
    }
    create(value) {
        const message = { acceptedTypes: [] };
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
                case /* repeated tdex.v1.ContentType accepted_types */ 1:
                    if (wireType === WireType.LengthDelimited)
                        for (let e = reader.int32() + reader.pos; reader.pos < e;)
                            message.acceptedTypes.push(reader.int32());
                    else
                        message.acceptedTypes.push(reader.int32());
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
        /* repeated tdex.v1.ContentType accepted_types = 1; */
        if (message.acceptedTypes.length) {
            writer.tag(1, WireType.LengthDelimited).fork();
            for (let i = 0; i < message.acceptedTypes.length; i++)
                writer.int32(message.acceptedTypes[i]);
            writer.join();
        }
        let u = options.writeUnknownFields;
        if (u !== false)
            (u == true ? UnknownFieldHandler.onWrite : u)(this.typeName, message, writer);
        return writer;
    }
}
/**
 * @generated MessageType for protobuf message tdex.v1.SupportedContentTypesResponse
 */
export const SupportedContentTypesResponse = new SupportedContentTypesResponse$Type();
/**
 * @generated ServiceType for protobuf service tdex.v1.TransportService
 */
export const TransportService = new ServiceType("tdex.v1.TransportService", [
    { name: "SupportedContentTypes", options: { "google.api.http": { get: "/v1/transport" } }, I: SupportedContentTypesRequest, O: SupportedContentTypesResponse }
]);
