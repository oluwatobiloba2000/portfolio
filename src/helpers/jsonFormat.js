const jsonFormatter = {
    error(res, status, code, data){
        res.status(code);
        res.json({
            status,
            data
        })
    },

    success(res, status, code, data){
        res.status(code);
        res.json({
            status,
            data
        })
    }
}

export default jsonFormatter;