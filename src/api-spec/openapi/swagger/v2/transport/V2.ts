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

import { RpcStatus, Tdexv2SupportedContentTypesResponse } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class V2<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags TransportService
   * @name TransportServiceSupportedContentTypes
   * @request GET:/v2/transport
   */
  transportServiceSupportedContentTypes = (params: RequestParams = {}) =>
    this.request<Tdexv2SupportedContentTypesResponse, RpcStatus>({
      path: `/v2/transport`,
      method: 'GET',
      format: 'json',
      ...params,
    });
}
