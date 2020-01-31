const express = require('express')
const app = express()
const port = 8000


app.get('/', (req, res) => res.send('Hello World!'))

app.get('/getdata', function(req,res){
    res.send({success:true, msg:"api hitted"});
})

app.listen(port, () => console.log(`Example app listening on port ${port}!`))