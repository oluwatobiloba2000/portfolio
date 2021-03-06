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

//setting last logout session
appRouter.put('/api/:id/setlastsession', lastLogoutController.updateLogoutSession);

//[getting current profile for users]
appRouter.get('/api/profile', profileController.Getprofile);
//special admin key needed
appRouter.post('/api/profile/post', checkToken, profileController.addProfile)
appRouter.put('/api/profile/:id/update', checkToken, profileController.updateProfile)


appRouter.get('/api/skills', skillsController.getSkills);
//special admin key needed to pass here
appRouter.post('/api/skills/post', checkToken, skillsController.addSkills)
appRouter.put('/api/skills/:id/update', checkToken,skillsController.updateSkills)
appRouter.delete('/api/skills/:id/delete',checkToken, skillsController.deleteSkill)


appRouter.get('/api/project', projectController.getProjects)
// spacial admin key needed
appRouter.post('/api/project/post', checkToken, projectController.addProject)
appRouter.put('/api/project/:id/update', checkToken, projectController.updateProject)
appRouter.delete('/api/project/:id/delete', checkToken, projectController.deleteProject)

// blog routes
appRouter.get(`/api/blog`, blogController.GetBlog)
//// spacial admin key needed
appRouter.post(`/api/blog/post`, checkToken, blogController.addBlog)
appRouter.delete(`/api/blog/:id/delete`)
appRouter.put(`/api/blog/:id/update`, checkToken, blogController.updateBlog)

//message route
appRouter.post(`/api/message/send`, contactMe.sendMessage)
// spacial admin key needed
appRouter.get(`/api/message`, checkToken, contactMe.GetMessage)
appRouter.post('/api/message/filter', checkToken, contactMe.FilterMessages)
appRouter.delete('/api/message/:id/delete', checkToken, contactMe.deleteMessage)
appRouter.put('/api/message/:id/star', checkToken, contactMe.starMessage)
appRouter.put('/api/message/:id/unstar', checkToken, contactMe.unstarMessage)
appRouter.put('/api/message/:id/trash', checkToken, contactMe.trashMessage)
appRouter.put('/api/message/:id/read', checkToken, contactMe.readMessage)
appRouter.put('/api/message/:id/unread', checkToken, contactMe.unreadMessage)

appRouter.post(`/api/activity/add`, checkToken, ActivityController.addAnActivity)
appRouter.get(`/api/activity/feed`, checkToken, ActivityController.Getactivities)
appRouter.put(`/api/activity/:id/read`, checkToken, ActivityController.readActvity)

appRouter.get('*', (req, res)=>{
    jsonFormatter.error(res, 'Unknown Route', 404)
})
export default appRouter;