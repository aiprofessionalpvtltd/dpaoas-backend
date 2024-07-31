const express = require("express");
const bodyParser = require("body-parser");
const cors = require('cors')
require('dotenv').config();
const path = require('path');
const swaggerUi = require('swagger-ui-express');
const swaggerSpec = require('./swaggerConfig');
const serveIndex = require('serve-index')
const appRoot = require('app-root-path')


const app = express();
const ngrokUrl = 'https://324c-39-33-242-31.ngrok-free.app';
//app.use(cors({ origin: ngrokUrl }));
app.use(cors());
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*'); // Allow requests from any origin
//   next();
// });
// app.use((req, res, next) => {
//   res.setHeader('Access-Control-Allow-Origin', '*');
//   res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE');
//   res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//   next();
// });
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

// -----------------------------------------------------------------


const isAuthenticated = require("./middleware/authToken");

const swaggerMiddleware = require('./middleware/swagger'); // Path to your swaggerMiddleware file
app.use('/', swaggerMiddleware);



// Import routers for each module
const rolesRouter = require("./routes/roles.route");
const leaveRouter = require("./routes/leave.route");
const employeeRouter = require("./routes/employee.route")
const usersRouter = require("./routes/users.route");
const permissionsRouter = require("./routes/permissions.route");
const modulesRouter = require("./routes/modules.route");
const departmentsRouter = require("./routes/departments.route");
const branchesRouter = require("./routes/branches.route");
const fileRegistersRouter = require("./routes/fileRegisters.route")
const fileRouter = require("./routes/file.route");
const filesDashboardRouter = require('./routes/filesDashboard.route')
const fileDiariesRouter = require('./routes/fileDiaries.route')
const mainHeadingFilesRouter = require('./routes/mainHeadingFile.route')
const freshReceiptsRouter = require('./routes/freshReceipt.route')
const casesRouter = require('./routes/cases.route')
const designationsRouter = require("./routes/designations.route");
const sessionsRouter = require("./routes/sessions.route")
const questionsRouter = require("./routes/questions.route")
const membersRouter = require("./routes/members.route");
const motionsRouter = require("./routes/motions.route");
const noticeOfficeReportRouter = require("./routes/noticeOfficeReport.route")

const resolutionRouter = require("./routes/resolution.route");
const rotaListRouter = require('./routes/rotaList.route')
const newRotaListRouter = require('./routes/newRotaList.route')
const manageSessionRouter = require("./routes/manageSessions.route");
const seatingPlanRouter = require("./routes/seatingPlan.route");
const contactTemplateRouter = require("./routes/contactTemplates.route");
const contactListRouter = require("./routes/contactLists.route");
const smsSentRouter = require("./routes/smsSents.route");
const questionListRouter = require("./routes/questionList.route")
const complaintsRouter = require('./routes/complaints.route')
const inventoryRouter = require('./routes/inventory.route')
const inventoryBillsRouter = require('./routes/inventoryBills.route')
const userInventoryRouter = require('./routes/userInventory.route')
const vendorsRouter = require('./routes/vendor.route')
const tonerInstallationRouter = require('./routes/tonerInstallation.route')
const tonerModelRouter = require('./routes/tonerModel.route')

const divisionsRouter = require("./routes/divisions.route")
const tenuresRouter = require("./routes/tenures.route")
const politicalPartiesRouter = require("./routes/politicalParties.route")
const parliamentaryYearsRouter = require("./routes/parliamentaryYears.route")
const termsRouter = require("./routes/terms.route")
const groupsRouter = require("./routes/groups.route")
const privateMemberBillRouter = require("./routes/privateMemberBills.route")
const legislativeBillRouter = require("./routes/legislativeBills.route")
const speechOnDemandRouter = require("./routes/speechOnDemands.route")
const requestResearchRouter = require("./routes/researchServices.route")

// LDU  Routes
const lawActRoutes = require('./routes/LDU/lawAct.route');



//mobile-app
const senatorAppRoute = require('./routes/senator-app.router')
const senatePublic = require('./routes/senate-public.router')
const authRoute = require('./routes/auth.router')
// MNAs
const mnas = require('./routes/mnas.route')
// Introduced In Senate Bill
const introducedInSenateBills = require('./routes/introducedInSenateBills.route')
// bill Statuses
const billStatuses = require('./routes/billStatuses.route')
// Manage Committee 
const manageCommittees = require('./routes/manageCommittees.route')
// Event Calender
const eventCalenders = require('./routes/eventCalenders.route')
// Ordinance route
const ordinances = require('./routes/ordinances.route')


const correspondenceRouter = require('./routes/correspondences.route')

// app.use((err, req, res, next) => {
//   console.log("error", err);
//   if (err && err.error && err.error.isJoi) {
//     console.log("errorssss", err);
//     // we had a joi error, let's return a custom 400 json response
//     res.status(400).json({
//       type: err.type, // will be "query" here, but could be "headers", "body", or "params"
//       message: err.error.toString()
//     });
//   } else {
//     // pass on to another error handler
//     next(err);
//   }
// });

// app.use(
//   '/assets',
//   express.static('pdfDownload'),
//   serveIndex('pdfDownload', { icons: true }),
// );

app.use('/assets', express.static('public'),
  serveIndex('public', { icons: true }),
);

const passRouter = require("./routes/pass.route")
const visitorRouter = require("./routes/visitor.route")

app.use((err, req, res, next) => {
  console.log("error", err);
  if (err && err.error && err.error.isJoi) {
    console.log("errorssss", err);
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});

  app.use(
    '/assets',
    express.static('pdfDownload'),
    serveIndex('pdfDownload', { icons: true }),
  )

  app.use(express.static(appRoot + '/uploads'))


app.use("/api/roles", isAuthenticated, rolesRouter);
app.use("/api/employee", isAuthenticated, employeeRouter)
app.use("/api/users", usersRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/departments" , isAuthenticated,departmentsRouter);
app.use("/api/designations", isAuthenticated, designationsRouter);
app.use("/api/pass", isAuthenticated, passRouter)
app.use("/api/visitor", isAuthenticated, visitorRouter)


app.use((err, req, res, next) => {
  console.log("error", err);
  if (err && err.error && err.error.isJoi) {
    console.log("errorssss", err);
    // we had a joi error, let's return a custom 400 json response
    res.status(400).json({
      type: err.type, // will be "query" here, but could be "headers", "body", or "params"
      message: err.error.toString()
    });
  } else {
    // pass on to another error handler
    next(err);
  }
});


// app.use('/assets', express.static('public'),
// serveIndex('public', { icons: true }),
// );




// Use routers for each module
app.use("/api/roles", rolesRouter);
app.use("/api/leave", leaveRouter);
app.use("/api/users", usersRouter);
app.use("/api/permissions", permissionsRouter);
app.use("/api/modules", modulesRouter);
app.use("/api/departments", departmentsRouter);
app.use("/api/branches", branchesRouter);
app.use("/api/fileRegisters", fileRegistersRouter)
app.use("/api/files", fileRouter);
app.use("/api/filesDashboard", filesDashboardRouter)
app.use("/api/mainHeading", mainHeadingFilesRouter)
app.use("/api/freshReceipt", freshReceiptsRouter)
app.use('/api/fileDiary', fileDiariesRouter)
app.use("/api/cases", casesRouter)
app.use("/api/designations", designationsRouter);
app.use("/api/sessions", sessionsRouter)
app.use("/api/questions", questionsRouter);
app.use("/api/members", membersRouter);
app.use("/api/motion", motionsRouter);
app.use("/api/manageSession", manageSessionRouter)
app.use("/api/seatingPlan", seatingPlanRouter)
app.use("/api/rota", rotaListRouter)
app.use("/api/new/rota", newRotaListRouter)

app.use("/api/questionList", questionListRouter)
app.use("/api/noticeOfficeReport", noticeOfficeReportRouter)
//resolutionRoutes
app.use("/api/resolution", resolutionRouter)
// complaints
app.use("/api/complaints", complaintsRouter)
app.use("/api/inventory", inventoryRouter)
app.use("/api/inventoryBills", inventoryBillsRouter)
app.use("/api/userInventory", userInventoryRouter)
app.use("/api/vendors", vendorsRouter)
app.use("/api/tonerInstallation", tonerInstallationRouter)
app.use("/api/tonerModel", tonerModelRouter)
// contactTemplateRoute
app.use("/api/contactTemplate", contactTemplateRouter);
app.use("/api/contactList", contactListRouter);
app.use("/api/sms", smsSentRouter);
// Question Sub Modules
app.use("/api/divisions", divisionsRouter)
app.use("/api/tenures", tenuresRouter)
app.use("/api/politicalParties", politicalPartiesRouter)
app.use("/api/parliamentaryYears", parliamentaryYearsRouter)
app.use("/api/terms", termsRouter)
app.use("/api/groups", groupsRouter)
//private member bill
app.use("/api/privateMemberBills", privateMemberBillRouter)
// legislative Bill
app.use("/api/legislativeBills", legislativeBillRouter)

// speech on demands
app.use("/api/senator/speech-on-demand", speechOnDemandRouter)
// speech on demands
app.use("/api/senator/request-research", requestResearchRouter)
//swagger
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
//mobile app
app.use('/api/senator', senatorAppRoute)
app.use('/api/senator/public', senatePublic)
app.use('/api/auth', authRoute)
// MNA route
app.use('/api/mnas', mnas)
// introduced In Senate Bill
app.use('/api/senate-bill', introducedInSenateBills)
// bill Statuses
app.use('/api/bill-Status', billStatuses)
// manage committees
app.use('/api/manage-committee', manageCommittees)
// Event Calender
app.use('/api/event-calender', eventCalenders)
// Ordinances route
app.use('/api/ordinance', ordinances)

app.use('/api/correspondence', correspondenceRouter)

// LDU Routes
app.use('/api/lawActs', lawActRoutes);

app.use(
  '/assets',
  express.static('pdfDownload'),
  serveIndex('pdfDownload', { icons: true }),
);


// Serve static files from the 'public' directory
app.use('/public', express.static('public'));



const flagRoutes = require('./routes/flagRoutes.route');


// Flag Module Routes
app.use('/api/flags', flagRoutes);

const PORT = process.env.LOCAL_PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
