import router from "express";
import jsonFormatter from  '../helpers/jsonFormat';
import profileController from '../controllers/profileController';
import skillsController from  '../controllers/skillsController';
import projectController from '../controllers/projectController';
import blogController from '../controllers/blogController';
import contactMe from '../controllers/contactMe';
import lastLogoutController from '../controllers/LastLogoutSession';
import {Authentication}from '../auth/index';
import {checkToken} from '../auth/index';
import ActivityController from '../controllers/activityController';
import LoginDetailsController from '../controllers/addLoginDetails';
import VisitorController from '../controllers/VisitorController';
const appRouter = router();

appRouter.get('/', (req, res)=>{
    return jsonFormatter.success(res, 'success', 200, 'none' ,'my portfolio site API made with Node and express by Anani oluwatobiloba');
})

appRouter.post('/api/login', Authentication.logInAuthUser);
appRouter.post('/api/pin', Authentication.PinAuth)
appRouter.get('/api/login/details', checkToken, LoginDetailsController.GetLoginDetails)
appRouter.post('/api/login/add', checkToken, LoginDetailsController.addLoginDetails)
appRouter.put('/api/login/update', checkToken, LoginDetailsController.updateLoginDetails)

appRouter.post('/api/login/visitor', Authentication.VisitorAuth);
appRouter.post('/api/visitor/add', checkToken, VisitorController.addVisitor)
appRouter.get('/api/visitor', checkToken, VisitorController.GetAllVisitor)
appRouter.post('/api/visitor/:id/:email/passphase/regenerate', checkToken, VisitorController.RegeneratePassPhase)
appRouter.delete('/api/visitor/:id/delete', checkToken, VisitorController.deleteVisitor)


export default appRouter;