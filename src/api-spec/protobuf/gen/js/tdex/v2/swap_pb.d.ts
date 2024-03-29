/* eslint-disable */
// @generated by protobuf-ts 2.9.0 with parameter add_pb_suffix,eslint_disable,ts_nocheck,long_type_string,output_javascript
// @generated from protobuf file "tdex/v2/swap.proto" (package "tdex.v2", syntax proto3)
// tslint:disable
// @ts-nocheck
import type { BinaryWriteOptions } from "@protobuf-ts/runtime";
import type { IBinaryWriter } from "@protobuf-ts/runtime";
import type { BinaryReadOptions } from "@protobuf-ts/runtime";
import type { IBinaryReader } from "@protobuf-ts/runtime";
import type { PartialMessage } from "@protobuf-ts/runtime";
import { MessageType } from "@protobuf-ts/runtime";
import { UnblindedInput } from "./types_pb";
/**
 * @generated from protobuf message tdex.v2.SwapRequest
 */
export interface SwapRequest {
    /**
     * Random unique identifier for the current message
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * The proposer's quantity
     *
     * @generated from protobuf field: uint64 amount_p = 2 [jstype = JS_STRING];
     */
    amountP: string;
    /**
     * The proposer's asset hash
     *
     * @generated from protobuf field: string asset_p = 3;
     */
    assetP: string;
    /**
     * The responder's quantity
     *
     * @generated from protobuf field: uint64 amount_r = 4 [jstype = JS_STRING];
     */
    amountR: string;
    /**
     * The responder's asset hash
     *
     * @generated from protobuf field: string asset_r = 5;
     */
    assetR: string;
    /**
     * The proposer's unsigned transaction in PSET v2 format (base64 string)
     *
     * @generated from protobuf field: string transaction = 6;
     */
    transaction: string;
    /**
     * The list of trader's unblinded inputs data, even in case they are
     * unconfidential.
     *
     * @generated from protobuf field: repeated tdex.v2.UnblindedInput unblinded_inputs = 7;
     */
    unblindedInputs: UnblindedInput[];
}
/**
 * @generated from protobuf message tdex.v2.SwapAccept
 */
export interface SwapAccept {
    /**
     * Random unique identifier for the current message
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * indetifier of the SwapRequest message
     *
     * @generated from protobuf field: string request_id = 2;
     */
    requestId: string;
    /**
     * The partial signed transaction base64 encoded containing the Responder's
     * signed inputs in a PSBT format
     *
     * @generated from protobuf field: string transaction = 3;
     */
    transaction: string;
    /**
     * In case of psetv2 transaction, the original list of trader's unblinded inputs,
     * including also those of the inputs added by the provider.
     *
     * @generated from protobuf field: repeated tdex.v2.UnblindedInput unblinded_inputs = 4;
     */
    unblindedInputs: UnblindedInput[];
}
/**
 * @generated from protobuf message tdex.v2.SwapComplete
 */
export interface SwapComplete {
    /**
     * Random unique identifier for the current message
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * indetifier of the SwapAccept message
     *
     * @generated from protobuf field: string accept_id = 2;
     */
    acceptId: string;
    /**
     * The signed transaction base64 encoded containing the Proposers's signed
     * inputs in a PSBT format
     *
     * @generated from protobuf field: string transaction = 3;
     */
    transaction: string;
}
/**
 * @generated from protobuf message tdex.v2.SwapFail
 */
export interface SwapFail {
    /**
     * Random unique identifier for the current message
     *
     * @generated from protobuf field: string id = 1;
     */
    id: string;
    /**
     * indetifier of either SwapRequest or SwapAccept message. It can be empty
     *
     * @generated from protobuf field: string message_id = 2;
     */
    messageId: string;
    /**
     * The failure code. It can be empty
     *
     * @generated from protobuf field: uint32 failure_code = 3;
     */
    failureCode: number;
    /**
     * The failure reason messaged
     *
     * @generated from protobuf field: string failure_message = 4;
     */
    failureMessage: string;
}
declare class SwapRequest$Type extends MessageType<SwapRequest> {
    constructor();
    create(value?: PartialMessage<SwapRequest>): SwapRequest;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SwapRequest): SwapRequest;
    internalBinaryWrite(message: SwapRequest, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapRequest
 */
export declare const SwapRequest: SwapRequest$Type;
declare class SwapAccept$Type extends MessageType<SwapAccept> {
    constructor();
    create(value?: PartialMessage<SwapAccept>): SwapAccept;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SwapAccept): SwapAccept;
    internalBinaryWrite(message: SwapAccept, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapAccept
 */
export declare const SwapAccept: SwapAccept$Type;
declare class SwapComplete$Type extends MessageType<SwapComplete> {
    constructor();
    create(value?: PartialMessage<SwapComplete>): SwapComplete;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SwapComplete): SwapComplete;
    internalBinaryWrite(message: SwapComplete, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapComplete
 */
export declare const SwapComplete: SwapComplete$Type;
declare class SwapFail$Type extends MessageType<SwapFail> {
    constructor();
    create(value?: PartialMessage<SwapFail>): SwapFail;
    internalBinaryRead(reader: IBinaryReader, length: number, options: BinaryReadOptions, target?: SwapFail): SwapFail;
    internalBinaryWrite(message: SwapFail, writer: IBinaryWriter, options: BinaryWriteOptions): IBinaryWriter;
}
/**
 * @generated MessageType for protobuf message tdex.v2.SwapFail
 */
export declare const SwapFail: SwapFail$Type;
export {};
