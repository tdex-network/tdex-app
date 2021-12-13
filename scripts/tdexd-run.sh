docker run -it -d --name tdexd \
-p 9945:9945 -p 9000:9000 \
-v `pwd`/tdexd:/home/user/.tdex-daemon \
-e TDEX_NO_MACAROONS=false \
-e TDEX_NETWORK="regtest" \
-e TDEX_BASE_ASSET="5ac9f65c0efcc4775e0baec4ec03abdde22473cd3cf33c0419ca290e0751b225" \
-e TDEX_LOG_LEVEL=5 \
-e TDEX_FEE_ACCOUNT_BALANCE_THRESHOLD=1000 \
-e TDEX_EXPLORER_ENDPOINT="http://chopsticks-liquid:3000" \
--network="nigiri" \
ghcr.io/tdex-network/tdexd:latest