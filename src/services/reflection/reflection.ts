import { createChannel, createClient } from 'nice-grpc-web';

import type {
  GetInfoRequest,
  DeepPartial,
  ReflectionServiceClient,
} from '../../api-spec/protobuf/gen/js/reflection/reflection/v1/service';
import { ReflectionServiceDefinition } from '../../api-spec/protobuf/gen/js/reflection/reflection/v1/service';

export class ReflectionService {
  private client: ReflectionServiceClient;

  constructor(providerUrl: string) {
    const channel = createChannel(providerUrl);
    this.client = createClient(ReflectionServiceDefinition, channel);
  }

  async *requestStream(numberOfRequests: number): AsyncIterable<DeepPartial<GetInfoRequest>> {
    for (let i = 0; i < numberOfRequests; i++) {
      yield {
        host: '',
        fileByFilename: '',
        fileContainingSymbol: '',
        fileContainingExtension: {
          containingType: '',
          extensionNumber: 0,
        },
        allExtensionNumbersOfType: '',
        listServices: '',
      };
    }
  }

  async getInfo(): Promise<any> {
    for await (const response of this.client.getInfo(this.requestStream(1))) {
      console.log(response.listServicesResponse);
    }
  }
}
