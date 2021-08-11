import { upsertPegins } from '../../src/redux/actions/btcActions';
import btcReducer, { initialState } from '../../src/redux/reducers/btcReducer';

describe('Btc reducer', () => {
  test('should return the initial state of one pegin plus two new pegins', () => {
    const state = {
      ...initialState,
      pegins: {
        '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
          depositAddress: {
            address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
            claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
            derivationPath: "m/84'/0'/0'/0/0",
          },
        },
      },
    };
    const pegins = {
      '00146a010acf97d317e0c22cc622c789dbee7f40876c': {
        depositAddress: {
          claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
          address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
          derivationPath: "m/84'/0'/0'/0/1",
        },
      },
      '00145f30a83267653cc442298fbca3f3137dae8e88da': {
        depositAddress: {
          claimScript: '00145f30a83267653cc442298fbca3f3137dae8e88da',
          address: 'bcrt1q4a6fez7zz7qjw2lrk6tnz20jfg59z5wr3slavt',
          derivationPath: "m/84'/0'/0'/0/2",
        },
      },
    };
    expect(btcReducer(state, upsertPegins(pegins))).toEqual({
      ...initialState,
      pegins: {
        '00145f30a83267653cc442298fbca3f3137dae8e88da': {
          depositAddress: {
            address: 'bcrt1q4a6fez7zz7qjw2lrk6tnz20jfg59z5wr3slavt',
            claimScript: '00145f30a83267653cc442298fbca3f3137dae8e88da',
            derivationPath: "m/84'/0'/0'/0/2",
          },
        },
        '00146a010acf97d317e0c22cc622c789dbee7f40876c': {
          depositAddress: {
            address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
            claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
            derivationPath: "m/84'/0'/0'/0/1",
          },
        },
        '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
          depositAddress: {
            address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
            claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
            derivationPath: "m/84'/0'/0'/0/0",
          },
        },
      },
    });
  });

  test('should update two pegins', () => {
    const state = {
      ...initialState,
      pegins: {
        '00145f30a83267653cc442298fbca3f3137dae8e88da': {
          depositAddress: {
            address: 'bcrt1q4a6fez7zz7qjw2lrk6tnz20jfg59z5wr3slavt',
            claimScript: '00145f30a83267653cc442298fbca3f3137dae8e88da',
            derivationPath: "m/84'/0'/0'/0/2",
          },
        },
        '00146a010acf97d317e0c22cc622c789dbee7f40876c': {
          depositAddress: {
            address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
            claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
            derivationPath: "m/84'/0'/0'/0/1",
          },
        },
        '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
          depositAddress: {
            address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
            claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
            derivationPath: "m/84'/0'/0'/0/0",
          },
        },
      },
    };
    expect(
      btcReducer(
        state,
        upsertPegins({
          '00146a010acf97d317e0c22cc622c789dbee7f40876c': {
            depositAddress: {
              claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
              address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
              derivationPath: "m/84'/0'/0'/0/1",
            },
            depositUtxos: {
              '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff:1': {
                txid: '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff',
                vout: 1,
                status: {
                  confirmed: false,
                },
                value: 200000000,
              },
            },
          },
          '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
            depositAddress: {
              claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
              address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
              derivationPath: "m/84'/0'/0'/0/0",
            },
            depositUtxos: {
              '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff:1': {
                txid: '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff',
                vout: 1,
                status: {
                  confirmed: true,
                  block_height: 102,
                  block_hash: '',
                  block_time: 121212,
                },
                value: 200000000,
                claimTxId: 'f5cbb4927c47bc34e41810948a10ca0304a7f293c6c1053058a6d1b3d0329bbd',
              },
            },
          },
        })
      )
    ).toEqual({
      ...initialState,
      pegins: {
        '00145f30a83267653cc442298fbca3f3137dae8e88da': {
          depositAddress: {
            address: 'bcrt1q4a6fez7zz7qjw2lrk6tnz20jfg59z5wr3slavt',
            claimScript: '00145f30a83267653cc442298fbca3f3137dae8e88da',
            derivationPath: "m/84'/0'/0'/0/2",
          },
        },
        '00146a010acf97d317e0c22cc622c789dbee7f40876c': {
          depositAddress: {
            claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
            address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
            derivationPath: "m/84'/0'/0'/0/1",
          },
          depositUtxos: {
            '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff:1': {
              txid: '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff',
              vout: 1,
              status: {
                confirmed: false,
              },
              value: 200000000,
            },
          },
        },
        '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
          depositAddress: {
            claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
            address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
            derivationPath: "m/84'/0'/0'/0/0",
          },
          depositUtxos: {
            '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff:1': {
              txid: '838228b25bf88186b7e95912afce225a0f05227cacc535e48b3d1030f93c0bff',
              vout: 1,
              status: {
                confirmed: true,
                block_height: 102,
                block_hash: '',
                block_time: 121212,
              },
              value: 200000000,
              claimTxId: 'f5cbb4927c47bc34e41810948a10ca0304a7f293c6c1053058a6d1b3d0329bbd',
            },
          },
        },
      },
    });
  });
});
