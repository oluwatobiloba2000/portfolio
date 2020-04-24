const jsonFormatter = {
    error(res, description, code, data, action){
        res.status(code);
        res.json({
            status : "error",
            description,
            data,
            action
        })
    },

    success(res, description, rowCount, data, code, action){
        res.status(code ? code : 200);
        res.json({
            status : "success",
            description,
            rowCount,
            data,
            action
        })
    },
    tokenFormat(res, description, token, email){
        res.status(200);
        res.json({
            status : "success",
            description,
            token,
            email
        })
    }
}

export default jsonFormatter;