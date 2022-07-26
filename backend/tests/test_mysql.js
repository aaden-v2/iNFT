const mysqlConn = require('../src/services/mysql')

async function queryTokenByID(tokenID) {
    return new Promise((resolve, reject) => {
        mysqlConn.queryTokenByID(tokenID, (content, image_url) => {
            // 代表正确拿到了这个db查询结果并通过resolve返回
            resolve({
                content,
                image_url
            })
            // 如果出错了你需要把error用reject返回，像 reject(error)
        })
    })
}

;(async () => {
    const dbRes = await queryTokenByID(3);
    console.log(dbRes);
})()
.catch(error => {
    console.error(error)
    process.exit(1)
})
