import router from "express";


const appRouter = router();

appRouter.get('/', (req, res)=>{
    res.status("200").send('PORTFOLIO SITE API')
})

export default appRouter;