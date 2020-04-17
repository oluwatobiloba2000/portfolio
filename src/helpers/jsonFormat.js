const jsonFormatter = {
    error(res, description, code, data){
        res.status(code);
        res.json({
            status : "error",
            description,
            data
        })
    },

    success(res, description, rowCount, data){
        res.status(200);
        res.json({
            status : "success",
            description,
            rowCount,
            data
        })
    },
    tokenFormat(res, description, token){
        res.status(200);
        res.json({
            status : "success",
            description,
            token
        })
    }
}

export default jsonFormatter;