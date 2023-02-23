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

import { RpcStatus, Tdexv1SupportedContentTypesResponse } from './data-contracts';
import { HttpClient, RequestParams } from './http-client';

export class V1<SecurityDataType = unknown> extends HttpClient<SecurityDataType> {
  /**
   * No description
   *
   * @tags TransportService
   * @name TransportServiceSupportedContentTypes
   * @request GET:/v1/transport
   */
  transportServiceSupportedContentTypes = (params: RequestParams = {}) =>
    this.request<Tdexv1SupportedContentTypesResponse, RpcStatus>({
      path: `/v1/transport`,
      method: 'GET',
      format: 'json',
      ...params,
    });
}
