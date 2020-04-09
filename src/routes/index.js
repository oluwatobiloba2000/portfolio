import router from "express";
import jsonFormatter from  '../helpers/jsonFormat'

const appRouter = router();

appRouter.get('/', (req, res)=>{
    return jsonFormatter.success(res, 'success', 200, 'my portfolio site API made with Node and express by Anani oluwatobiloba');
})

export default appRouter;