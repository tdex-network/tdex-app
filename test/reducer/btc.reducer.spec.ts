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
            claimTxId:
              '334a48f635942e3a35c284b9787144826bed4692a2423005513490540dbb7dff',
            depositAddress: {
              claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
              address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
              derivationPath: "m/84'/0'/0'/0/1",
            },
            depositAmount: 350000000,
            depositTxId:
              '0df345842e793881fdd1e91ee89bd7177485a09672582234e87a8540742c5dce',
            depositBlockHeight: 203,
          },
          '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
            claimTxId:
              'f5cbb4927c47bc34e41810948a10ca0304a7f293c6c1053058a6d1b3d0329bbd',
            depositAddress: {
              claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
              address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
              derivationPath: "m/84'/0'/0'/0/0",
            },
            depositAmount: 100000000,
            depositTxId:
              '5ddad322e325207e87deeb25436c4604342c7ab3d3f3588bbafe0f2dfb1c5440',
            depositBlockHeight: 102,
          },
        }),
      ),
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
          claimTxId:
            '334a48f635942e3a35c284b9787144826bed4692a2423005513490540dbb7dff',
          depositAddress: {
            claimScript: '00146a010acf97d317e0c22cc622c789dbee7f40876c',
            address: 'bcrt1qkcdq27w3zy5g8zekwreuzp4n9vd2jryjnql7dq',
            derivationPath: "m/84'/0'/0'/0/1",
          },
          depositAmount: 350000000,
          depositTxId:
            '0df345842e793881fdd1e91ee89bd7177485a09672582234e87a8540742c5dce',
          depositBlockHeight: 203,
        },
        '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8': {
          claimTxId:
            'f5cbb4927c47bc34e41810948a10ca0304a7f293c6c1053058a6d1b3d0329bbd',
          depositAddress: {
            claimScript: '0014d863bb0f322219f3b0647a21d17ed44bf8fa9ae8',
            address: 'bcrt1qjg2rhft36x2zfskmndvmelmdzf4dxfq5ud0953',
            derivationPath: "m/84'/0'/0'/0/0",
          },
          depositAmount: 100000000,
          depositTxId:
            '5ddad322e325207e87deeb25436c4604342c7ab3d3f3588bbafe0f2dfb1c5440',
          depositBlockHeight: 102,
        },
      },
    });
  });
});
