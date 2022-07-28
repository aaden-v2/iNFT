iNFT is a ad delivery tool for Web3 users.

Here is our front-end for this use case
<img width="1416" alt="image" src="https://user-images.githubusercontent.com/110060927/181097709-165c070e-94a1-416f-a7bb-89ed530a092b.png">

<img width="1416" alt="image" src="https://user-images.githubusercontent.com/110060927/181097740-8a3ee871-1fe6-4e70-b31b-873147d7d3e4.png">




## INSTALL

`npm i`

## RUN

start

`npm start`

stop

`npm stop`

tail logs

`npm run logs`

## API

create token

```
curl -XPOST 127.0.0.1:5003/tokens/ -d "{\"image_url\":\"google.com\"}" -H "content-type: application/json; charset=UTF-8"
{"errorCode":0,"errorMsg":"success","data":{}}
```

get token

```
curl -XGET 127.0.0.1:5003/tokens/1/
```
