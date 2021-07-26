import React from "react";
import "./App.css";
import { BrowserRouter, Switch, Route, Redirect } from "react-router-dom";
import axios from "axios";
import jwt_decode from "jwt-decode";
import * as ActionTypes from "./redux/types";

import { Provider } from "react-redux";
import store from "./redux/store";

import log from "./pages/login";
import sign from "./pages/ssignup";
import lesson from "./pages/lessons";
import assignment from "./pages/assignments";
import live from "./pages/live";
import showLesson from "./pages/showLesson";
import moduleShow from "./pages/moduleShow";
import newModule from "./pages/newModule";
import quizres from "./pages/quizres";
import showAssign from "./pages/showAssign";
import writtenAssignment from "./pages/writtenAssignment";
import quizSubmission from "./pages/quizSubmission";
import quizShow from "./pages/quizPage";
import assignmentSubmission from "./pages/assignmentSubmission";
import analysisList from "./pages/analysisList";
import asgnquizres from "./pages/asgnquizres";
import newAsgn from "./pages/addAssignment";
import studentAnalysis from "./pages/studentAnalysis";
import livePage from "./pages/livePage";

axios.defaults.baseURL = "/api";
// "http://localhost:5001/interndemo-25232/us-central1/api/";
// axios.defaults.baseURL = 'https://us-central1-interndemo-25232.cloudfunctions.net/api';

let token = localStorage.token;
if (token) {
  var decoded = jwt_decode(token);
  console.log(Date.now(), decoded.exp);
  if (Date.now() < decoded.exp * 1000) {
    axios.defaults.headers.common["Authorization"] = token;
    axios
      .post("/login", {
        localId: decoded.user_id,
      })
      .then((resdata) => {
        store.dispatch({
          type: ActionTypes.LOGIN_USER,
          payload: resdata.data,
        });
      })
      .catch((err) => {
        console.log(err);
      });
  } else {
    localStorage.removeItem("token");
    alert("Session Expired! Please login again");
  }
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <Switch>
          <Route exact path="/login" component={log} />
          <Route exact path="/signup" component={sign} />
          <Route exact path="/lessons" component={lesson} />
          <Route exact path="/assignments" component={assignment} />
          <Route exact path="/live" component={live} />
          <Route exact path="/live/:id" component={livePage} />
          <Route exact path="/module/quizes/:ref/result" component={quizres} />
          <Route exact path="/lessons/:lessonId" component={showLesson} />
          <Route exact path="/assignments/:assgnId" component={showAssign} />
          <Route exact path="/module/new/:chapId" component={newModule} />
          <Route exact path="/assignment/new/:asgnId" component={newAsgn} />
          <Route
            exact
            path="/module/:type/:chapId/:ref"
            component={moduleShow}
          />

          <Route
            exact
            path="/assinments/quiz/:ref/result"
            component={asgnquizres}
          />
          <Route
            exact
            path="/assinments/quiz/:asgnId/:id"
            component={quizShow}
          />
          <Route
            exact
            path="/assinments/quizes/:id/submissions"
            component={quizSubmission}
          />
          <Route
            exact
            path="/assinments/written/:id/submissions"
            component={assignmentSubmission}
          />
          <Route
            exact
            path="/assinments/written/:asgnId/:id"
            component={writtenAssignment}
          />
          <Route
            exact
            path="/analysis/student/:userid"
            component={studentAnalysis}
          />
          <Route exact path="/analysis" component={analysisList} />
          <Redirect to="/login" />
        </Switch>
      </BrowserRouter>
    </Provider>
  );
}

export default App;
