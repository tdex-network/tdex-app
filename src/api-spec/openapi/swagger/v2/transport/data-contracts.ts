/* eslint-disable */
/* tslint:disable */
/*
 * ---------------------------------------------------------------
 * ## THIS FILE WAS GENERATED VIA SWAGGER-TYPESCRIPT-API        ##
 * ##                                                           ##
 * ## AUTHOR: acacode                                           ##
 * ## SOURCE: https://github.com/acacode/swagger-typescript-api ##
 * ---------------------------------------------------------------
 */

export interface ProtobufAny {
  '@type'?: string;
  [key: string]: any;
}

export interface RpcStatus {
  /** @format int32 */
  code?: number;
  message?: string;
  details?: ProtobufAny[];
}

/** @default "CONTENT_TYPE_JSON" */
export enum Tdexv2ContentType {
  CONTENT_TYPE_JSON = 'CONTENT_TYPE_JSON',
  CONTENT_TYPE_GRPC = 'CONTENT_TYPE_GRPC',
  CONTENT_TYPE_GRPCWEB = 'CONTENT_TYPE_GRPCWEB',
  CONTENT_TYPE_GRPCWEBTEXT = 'CONTENT_TYPE_GRPCWEBTEXT',
}

export interface Tdexv2SupportedContentTypesResponse {
  acceptedTypes?: Tdexv2ContentType[];
}
