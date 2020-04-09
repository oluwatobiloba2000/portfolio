const jsonFormatter = {
    error(res, status, code, data){
        res.status(code)
        res.json({
            status,
            data : data
        })
    },

    success(res, status, code, data){
        res.status(code)
        res.json({
            status,
            data: data
        })
    }
}

export default jsonFormatter;