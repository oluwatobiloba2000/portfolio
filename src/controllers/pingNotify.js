class Controller{
    static async GetServerStatus (req, res){
        return res.send('ping');
    }
}

export default Controller;