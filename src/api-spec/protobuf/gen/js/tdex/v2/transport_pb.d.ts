/* eslint-disable */
// @generated by protobuf-ts 2.9.0 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v2/transport.proto" (package "tdex.v2", syntax proto3)
// tslint:disable
// @ts-nocheck
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { ContentType } from "./types_pb";
/**
 * @generated from protobuf message tdex.v2.SupportedContentTypesRequest
 */
export interface SupportedContentTypesRequest {
}
/**
 * @generated from protobuf message tdex.v2.SupportedContentTypesResponse
 */
export interface SupportedContentTypesResponse {
    /**
     * @generated from protobuf field: repeated tdex.v2.ContentType accepted_types = 1;
     */
    acceptedTypes: ContentType[];
}
declare class SupportedContentTypesRequest$Type extends MessageType<SupportedContentTypesRequest> {
    constructor();
    create(value?: PartialMessage<SupportedContentTypesRequest>): SupportedContentTypesRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SupportedContentTypesRequest): SupportedContentTypesRequest;
    internalBinaryWrite(message: SupportedContentTypesRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SupportedContentTypesRequest
 */
export declare const SupportedContentTypesRequest: SupportedContentTypesRequest$Type;
declare class SupportedContentTypesResponse$Type extends MessageType<SupportedContentTypesResponse> {
    constructor();
    create(value?: PartialMessage<SupportedContentTypesResponse>): SupportedContentTypesResponse;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SupportedContentTypesResponse): SupportedContentTypesResponse;
    internalBinaryWrite(message: SupportedContentTypesResponse, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SupportedContentTypesResponse
 */
export declare const SupportedContentTypesResponse: SupportedContentTypesResponse$Type;
/**
 * @generated ServiceType for protobuf service tdex.v2.TransportService
 */
export declare const TransportService: any;
export {};
