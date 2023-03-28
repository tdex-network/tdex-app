/* eslint-disable */
import type { CallContext, CallOptions } from "nice-grpc-common";
import _m0 from "protobufjs/minimal";

export const protobufPackage = "reflection.v1";

/** The message sent by the client when calling GetInfo method. */
export interface GetInfoRequest {
  host: string;
  /** Find a proto file by the file name. */
  fileByFilename?:
    | string
    | undefined;
  /**
   * Find the proto file that declares the given fully-qualified symbol name.
   * This field should be a fully-qualified symbol name
   * (e.g. <package>.<service>[.<method>] or <package>.<type>).
   */
  fileContainingSymbol?:
    | string
    | undefined;
  /**
   * Find the proto file which defines an extension extending the given
   * message type with the given field number.
   */
  fileContainingExtension?:
    | ExtensionRequest
    | undefined;
  /**
   * Finds the tag numbers used by all known extensions of the given message
   * type, and appends them to ExtensionNumberResponse in an undefined order.
   * Its corresponding method is best-effort: it's not guaranteed that the
   * reflection service will implement this method, and it's not guaranteed
   * that this method will provide all extensions. Returns
   * StatusCode::UNIMPLEMENTED if it's not implemented.
   * This field should be a fully-qualified type name. The format is
   * <package>.<type>
   */
  allExtensionNumbersOfType?:
    | string
    | undefined;
  /**
   * List the full names of registered services. The content will not be
   * checked.
   */
  listServices?: string | undefined;
}

/**
 * The type name and extension number sent by the client when requesting
 * file_containing_extension.
 */
export interface ExtensionRequest {
  /** Fully-qualified type name. The format should be <package>.<type> */
  containingType: string;
  extensionNumber: number;
}

/** The message sent by the server to answer ServerReflectionInfo method. */
export interface GetInfoResponse {
  validHost: string;
  originalRequest:
    | GetInfoRequest
    | undefined;
  /**
   * This message is used to answer file_by_filename, file_containing_symbol,
   * file_containing_extension requests with transitive dependencies.
   * As the repeated label is not allowed in oneof fields, we use a
   * FileDescriptorResponse message to encapsulate the repeated fields.
   * The reflection service is allowed to avoid sending FileDescriptorProtos
   * that were previously sent in response to earlier requests in the stream.
   */
  fileDescriptorResponse?:
    | FileDescriptorResponse
    | undefined;
  /** This message is used to answer all_extension_numbers_of_type requests. */
  allExtensionNumbersResponse?:
    | ExtensionNumberResponse
    | undefined;
  /** This message is used to answer list_services requests. */
  listServicesResponse?:
    | ListServiceResponse
    | undefined;
  /** This message is used when an error occurs. */
  errorResponse?: ErrorResponse | undefined;
}

/**
 * Serialized FileDescriptorProto messages sent by the server answering
 * a file_by_filename, file_containing_symbol, or file_containing_extension
 * request.
 */
export interface FileDescriptorResponse {
  /**
   * Serialized FileDescriptorProto messages. We avoid taking a dependency on
   * descriptor.proto, which uses proto2 only features, by making them opaque
   * bytes instead.
   */
  fileDescriptorProto: Uint8Array[];
}

/**
 * A list of extension numbers sent by the server answering
 * all_extension_numbers_of_type request.
 */
export interface ExtensionNumberResponse {
  /**
   * Full name of the base type, including the package name. The format
   * is <package>.<type>
   */
  baseTypeName: string;
  extensionNumber: number[];
}

/** A list of ServiceResponse sent by the server answering list_services request. */
export interface ListServiceResponse {
  /**
   * The information of each service may be expanded in the future, so we use
   * ServiceResponse message to encapsulate it.
   */
  service: ServiceResponse[];
}

/**
 * The information of a single service used by ListServiceResponse to answer
 * list_services request.
 */
export interface ServiceResponse {
  /**
   * Full name of a registered service, including its package name. The format
   * is <package>.<service>
   */
  name: string;
}

/** The error code and error message sent by the server when an error occurs. */
export interface ErrorResponse {
  /** This field uses the error codes defined in grpc::StatusCode. */
  errorCode: number;
  errorMessage: string;
}

function createBaseGetInfoRequest(): GetInfoRequest {
  return {
    host: "",
    fileByFilename: undefined,
    fileContainingSymbol: undefined,
    fileContainingExtension: undefined,
    allExtensionNumbersOfType: undefined,
    listServices: undefined,
  };
}

export const GetInfoRequest = {
  encode(message: GetInfoRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.host !== "") {
      writer.uint32(10).string(message.host);
    }
    if (message.fileByFilename !== undefined) {
      writer.uint32(26).string(message.fileByFilename);
    }
    if (message.fileContainingSymbol !== undefined) {
      writer.uint32(34).string(message.fileContainingSymbol);
    }
    if (message.fileContainingExtension !== undefined) {
      ExtensionRequest.encode(message.fileContainingExtension, writer.uint32(42).fork()).ldelim();
    }
    if (message.allExtensionNumbersOfType !== undefined) {
      writer.uint32(50).string(message.allExtensionNumbersOfType);
    }
    if (message.listServices !== undefined) {
      writer.uint32(58).string(message.listServices);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetInfoRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.host = reader.string();
          continue;
        case 3:
          if (tag != 26) {
            break;
          }

          message.fileByFilename = reader.string();
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.fileContainingSymbol = reader.string();
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.fileContainingExtension = ExtensionRequest.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.allExtensionNumbersOfType = reader.string();
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.listServices = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetInfoRequest>): GetInfoRequest {
    return GetInfoRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetInfoRequest>): GetInfoRequest {
    const message = createBaseGetInfoRequest();
    message.host = object.host ?? "";
    message.fileByFilename = object.fileByFilename ?? undefined;
    message.fileContainingSymbol = object.fileContainingSymbol ?? undefined;
    message.fileContainingExtension =
      (object.fileContainingExtension !== undefined && object.fileContainingExtension !== null)
        ? ExtensionRequest.fromPartial(object.fileContainingExtension)
        : undefined;
    message.allExtensionNumbersOfType = object.allExtensionNumbersOfType ?? undefined;
    message.listServices = object.listServices ?? undefined;
    return message;
  },
};

function createBaseExtensionRequest(): ExtensionRequest {
  return { containingType: "", extensionNumber: 0 };
}

export const ExtensionRequest = {
  encode(message: ExtensionRequest, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.containingType !== "") {
      writer.uint32(10).string(message.containingType);
    }
    if (message.extensionNumber !== 0) {
      writer.uint32(16).int32(message.extensionNumber);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExtensionRequest {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExtensionRequest();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.containingType = reader.string();
          continue;
        case 2:
          if (tag != 16) {
            break;
          }

          message.extensionNumber = reader.int32();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExtensionRequest>): ExtensionRequest {
    return ExtensionRequest.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ExtensionRequest>): ExtensionRequest {
    const message = createBaseExtensionRequest();
    message.containingType = object.containingType ?? "";
    message.extensionNumber = object.extensionNumber ?? 0;
    return message;
  },
};

function createBaseGetInfoResponse(): GetInfoResponse {
  return {
    validHost: "",
    originalRequest: undefined,
    fileDescriptorResponse: undefined,
    allExtensionNumbersResponse: undefined,
    listServicesResponse: undefined,
    errorResponse: undefined,
  };
}

export const GetInfoResponse = {
  encode(message: GetInfoResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.validHost !== "") {
      writer.uint32(10).string(message.validHost);
    }
    if (message.originalRequest !== undefined) {
      GetInfoRequest.encode(message.originalRequest, writer.uint32(18).fork()).ldelim();
    }
    if (message.fileDescriptorResponse !== undefined) {
      FileDescriptorResponse.encode(message.fileDescriptorResponse, writer.uint32(34).fork()).ldelim();
    }
    if (message.allExtensionNumbersResponse !== undefined) {
      ExtensionNumberResponse.encode(message.allExtensionNumbersResponse, writer.uint32(42).fork()).ldelim();
    }
    if (message.listServicesResponse !== undefined) {
      ListServiceResponse.encode(message.listServicesResponse, writer.uint32(50).fork()).ldelim();
    }
    if (message.errorResponse !== undefined) {
      ErrorResponse.encode(message.errorResponse, writer.uint32(58).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): GetInfoResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseGetInfoResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.validHost = reader.string();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.originalRequest = GetInfoRequest.decode(reader, reader.uint32());
          continue;
        case 4:
          if (tag != 34) {
            break;
          }

          message.fileDescriptorResponse = FileDescriptorResponse.decode(reader, reader.uint32());
          continue;
        case 5:
          if (tag != 42) {
            break;
          }

          message.allExtensionNumbersResponse = ExtensionNumberResponse.decode(reader, reader.uint32());
          continue;
        case 6:
          if (tag != 50) {
            break;
          }

          message.listServicesResponse = ListServiceResponse.decode(reader, reader.uint32());
          continue;
        case 7:
          if (tag != 58) {
            break;
          }

          message.errorResponse = ErrorResponse.decode(reader, reader.uint32());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<GetInfoResponse>): GetInfoResponse {
    return GetInfoResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<GetInfoResponse>): GetInfoResponse {
    const message = createBaseGetInfoResponse();
    message.validHost = object.validHost ?? "";
    message.originalRequest = (object.originalRequest !== undefined && object.originalRequest !== null)
      ? GetInfoRequest.fromPartial(object.originalRequest)
      : undefined;
    message.fileDescriptorResponse =
      (object.fileDescriptorResponse !== undefined && object.fileDescriptorResponse !== null)
        ? FileDescriptorResponse.fromPartial(object.fileDescriptorResponse)
        : undefined;
    message.allExtensionNumbersResponse =
      (object.allExtensionNumbersResponse !== undefined && object.allExtensionNumbersResponse !== null)
        ? ExtensionNumberResponse.fromPartial(object.allExtensionNumbersResponse)
        : undefined;
    message.listServicesResponse = (object.listServicesResponse !== undefined && object.listServicesResponse !== null)
      ? ListServiceResponse.fromPartial(object.listServicesResponse)
      : undefined;
    message.errorResponse = (object.errorResponse !== undefined && object.errorResponse !== null)
      ? ErrorResponse.fromPartial(object.errorResponse)
      : undefined;
    return message;
  },
};

function createBaseFileDescriptorResponse(): FileDescriptorResponse {
  return { fileDescriptorProto: [] };
}

export const FileDescriptorResponse = {
  encode(message: FileDescriptorResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.fileDescriptorProto) {
      writer.uint32(10).bytes(v!);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): FileDescriptorResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseFileDescriptorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.fileDescriptorProto.push(reader.bytes());
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<FileDescriptorResponse>): FileDescriptorResponse {
    return FileDescriptorResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<FileDescriptorResponse>): FileDescriptorResponse {
    const message = createBaseFileDescriptorResponse();
    message.fileDescriptorProto = object.fileDescriptorProto?.map((e) => e) || [];
    return message;
  },
};

function createBaseExtensionNumberResponse(): ExtensionNumberResponse {
  return { baseTypeName: "", extensionNumber: [] };
}

export const ExtensionNumberResponse = {
  encode(message: ExtensionNumberResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.baseTypeName !== "") {
      writer.uint32(10).string(message.baseTypeName);
    }
    writer.uint32(18).fork();
    for (const v of message.extensionNumber) {
      writer.int32(v);
    }
    writer.ldelim();
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ExtensionNumberResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseExtensionNumberResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.baseTypeName = reader.string();
          continue;
        case 2:
          if (tag == 16) {
            message.extensionNumber.push(reader.int32());
            continue;
          }

          if (tag == 18) {
            const end2 = reader.uint32() + reader.pos;
            while (reader.pos < end2) {
              message.extensionNumber.push(reader.int32());
            }

            continue;
          }

          break;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ExtensionNumberResponse>): ExtensionNumberResponse {
    return ExtensionNumberResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ExtensionNumberResponse>): ExtensionNumberResponse {
    const message = createBaseExtensionNumberResponse();
    message.baseTypeName = object.baseTypeName ?? "";
    message.extensionNumber = object.extensionNumber?.map((e) => e) || [];
    return message;
  },
};

function createBaseListServiceResponse(): ListServiceResponse {
  return { service: [] };
}

export const ListServiceResponse = {
  encode(message: ListServiceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    for (const v of message.service) {
      ServiceResponse.encode(v!, writer.uint32(10).fork()).ldelim();
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ListServiceResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseListServiceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.service.push(ServiceResponse.decode(reader, reader.uint32()));
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ListServiceResponse>): ListServiceResponse {
    return ListServiceResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ListServiceResponse>): ListServiceResponse {
    const message = createBaseListServiceResponse();
    message.service = object.service?.map((e) => ServiceResponse.fromPartial(e)) || [];
    return message;
  },
};

function createBaseServiceResponse(): ServiceResponse {
  return { name: "" };
}

export const ServiceResponse = {
  encode(message: ServiceResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.name !== "") {
      writer.uint32(10).string(message.name);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ServiceResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseServiceResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 10) {
            break;
          }

          message.name = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ServiceResponse>): ServiceResponse {
    return ServiceResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ServiceResponse>): ServiceResponse {
    const message = createBaseServiceResponse();
    message.name = object.name ?? "";
    return message;
  },
};

function createBaseErrorResponse(): ErrorResponse {
  return { errorCode: 0, errorMessage: "" };
}

export const ErrorResponse = {
  encode(message: ErrorResponse, writer: _m0.Writer = _m0.Writer.create()): _m0.Writer {
    if (message.errorCode !== 0) {
      writer.uint32(8).int32(message.errorCode);
    }
    if (message.errorMessage !== "") {
      writer.uint32(18).string(message.errorMessage);
    }
    return writer;
  },

  decode(input: _m0.Reader | Uint8Array, length?: number): ErrorResponse {
    const reader = input instanceof _m0.Reader ? input : _m0.Reader.create(input);
    let end = length === undefined ? reader.len : reader.pos + length;
    const message = createBaseErrorResponse();
    while (reader.pos < end) {
      const tag = reader.uint32();
      switch (tag >>> 3) {
        case 1:
          if (tag != 8) {
            break;
          }

          message.errorCode = reader.int32();
          continue;
        case 2:
          if (tag != 18) {
            break;
          }

          message.errorMessage = reader.string();
          continue;
      }
      if ((tag & 7) == 4 || tag == 0) {
        break;
      }
      reader.skipType(tag & 7);
    }
    return message;
  },

  create(base?: DeepPartial<ErrorResponse>): ErrorResponse {
    return ErrorResponse.fromPartial(base ?? {});
  },

  fromPartial(object: DeepPartial<ErrorResponse>): ErrorResponse {
    const message = createBaseErrorResponse();
    message.errorCode = object.errorCode ?? 0;
    message.errorMessage = object.errorMessage ?? "";
    return message;
  },
};

export type ReflectionServiceDefinition = typeof ReflectionServiceDefinition;
export const ReflectionServiceDefinition = {
  name: "ReflectionService",
  fullName: "reflection.v1.ReflectionService",
  methods: {
    /**
     * The reflection service is structured as a bidirectional stream, ensuring
     * all related requests go to a single server.
     */
    getInfo: {
      name: "GetInfo",
      requestType: GetInfoRequest,
      requestStream: true,
      responseType: GetInfoResponse,
      responseStream: true,
      options: { _unknownFields: { 578365826: [new Uint8Array([10, 18, 8, 47, 118, 49, 47, 105, 110, 102, 111])] } },
    },
  },
} as const;

export interface ReflectionServiceImplementation<CallContextExt = {}> {
  /**
   * The reflection service is structured as a bidirectional stream, ensuring
   * all related requests go to a single server.
   */
  getInfo(
    request: AsyncIterable<GetInfoRequest>,
    context: CallContext & CallContextExt,
  ): ServerStreamingMethodResult<DeepPartial<GetInfoResponse>>;
}

export interface ReflectionServiceClient<CallOptionsExt = {}> {
  /**
   * The reflection service is structured as a bidirectional stream, ensuring
   * all related requests go to a single server.
   */
  getInfo(
    request: AsyncIterable<DeepPartial<GetInfoRequest>>,
    options?: CallOptions & CallOptionsExt,
  ): AsyncIterable<GetInfoResponse>;
}

type Builtin = Date | Function | Uint8Array | string | number | boolean | undefined;

export type DeepPartial<T> = T extends Builtin ? T
  : T extends Array<infer U> ? Array<DeepPartial<U>> : T extends ReadonlyArray<infer U> ? ReadonlyArray<DeepPartial<U>>
  : T extends {} ? { [K in keyof T]?: DeepPartial<T[K]> }
  : Partial<T>;

export type ServerStreamingMethodResult<Response> = { [Symbol.asyncIterator](): AsyncIterator<Response, void> };
